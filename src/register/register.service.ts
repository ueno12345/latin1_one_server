import { Injectable } from '@nestjs/common';
import { admin } from '@config/firebase';
import { GeoPoint } from '@google-cloud/firestore';
import { Timestamp } from 'firebase-admin/firestore';

@Injectable()
export class RegisterService {
  private async getNextIdForTopic(topic: string): Promise<number> {
    const db = admin.firestore();
    const docRef = db.collection('topicCounters').doc(topic); // トピックごとのカウンタ用ドキュメント

    return await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef); // ドキュメントを取得
      let currentId = 0;

      if (doc.exists) {
        // ドキュメントが存在する場合は、currentIdを取得
        currentId = doc.data()?.currentId || 1; // currentIdがundefinedなら0を使用
      }

      // IDをインクリメント
      const newId = currentId + 1;

      // 新しいカウンタを設定
      transaction.set(docRef, { currentId: newId }, { merge: true }); // currentIdを新しい値で更新

      return newId; // 新しいIDを返す
    });
  }

  private async addDataToFirestore(collectionId: string, documentId: string, data: { [key: string]: any }) {
    const db = admin.firestore();
    const docRef = db.collection(collectionId).doc(documentId);

    // データをマップとして保存
    await docRef.set(data, { merge: true });
    console.log(`Added/updated document with ID: ${documentId}`);
  }

  async registerFirebase(
    category: string,
    title: string,
    body: string,
    image: string
  ): Promise<void> {
    try {
      const date = new Date().toISOString().split('T')[0];

      // IDを取得
      const uniqueId = await this.getNextIdForTopic(category);

      // データをマップとして作成
      const data = {
        [`${category}${uniqueId}`]: {
          date,
          title,
          body,
          image,
        },
      };

      // Firestoreにデータを追加
      await this.addDataToFirestore("tests", category, data);
      console.log('Data added successfully');
    } catch (error) {
      console.error('Error adding data:', error);
    }
  }

  async registerInbox(
    topic: string,
    title: string,
    body: string,
    image: string
  ): Promise<void> {
    try {
      const date = new Date().toISOString().split('T')[0];

      // IDを取得
      const uniqueId = await this.getNextIdForTopic(topic);

      // データをマップとして作成
      const data = {
        [`${topic}${uniqueId}`]: {
          date,
          title,
          body,
          image,
        },
      };

      // FirestoreのInboxにデータを追加
      await this.addDataToFirestore("inbox", topic, data);
      console.log('Data added successfully');
    } catch (error) {
      console.error('Error adding data:', error);
    }
  }

  async registerToFirestore(Data: any[]): Promise<void> {
    const firestore = admin.firestore();
    const batch = firestore.batch(); // バッチを作成

    for (const item of Data) {
      const hasProductData = item.shopName && item.productName && item.description && item.price !== undefined && item.productType && item.category && item.countryOfOrigin && item.imagePath;
      const hasShopData = item.shopName && item.address && item.phoneNumber && item.postalCode && item.openTime && item.closeTime && item.latitude !== undefined && item.longitude !== undefined;

      if (hasShopData) {
        const shop = {
          shopName: item.shopName,
          address: item.address,
          phoneNumber: item.phoneNumber,
          postalCode: item.postalCode,
          geopoint: new GeoPoint(item.latitude, item.longitude),
          businessHours: {
            openTime: item.openTime,
            closeTime: item.closeTime,
          },
        };

        const shopRef = firestore.collection('shops').doc(item.shopName);
        batch.set(shopRef, shop);

      } else if (hasProductData) {
        const product = {
          shopName: item.shopName,
          productName: item.productName,
          description: item.description,
          price: item.price,
          productType: item.productType,
          category: item.category,
          countryOfOrigin: item.countryOfOrigin,
          imagePath: item.imagePath,
        };

        const shopQuerySnapshot = await firestore.collection('shops').where('shopName', '==', item.shopName).get();

        if (!shopQuerySnapshot.empty) {
          shopQuerySnapshot.forEach((shopDoc) => {
            const productRef = firestore.collection('shops').doc(shopDoc.id).collection('products').doc(item.productName);
            batch.set(productRef, product);
          });
        } else {
          console.log(`商品を登録したい店舗が存在しません: ${item.shopName}`);
        }
      } else {
        console.log(`データが不完全です:`, item);
      }
    }
    // バッチをコミット
    await batch.commit();
  }

  async updateDeliveryStatus(token: string, timestamp: string, newStatus: boolean): Promise<void> {
    const firestore = admin.firestore();
    const ordersRef = firestore.collection("order");
    const formattedTime = timestamp.replace(/(\d{4})年(\d{2})月(\d{2})日(\d{2})時(\d{2})分(\d{2})秒/, '$1-$2-$3T$4:$5:$6');
    const date = new Date(formattedTime); // Dateオブジェクトに変換
    if (isNaN(date.getTime())) {
      console.log(`無効な日付形式です: ${timestamp}`);
      return;
    }
    // DateオブジェクトをTimestampに変換
    const timestampFromString = Timestamp.fromDate(date);
    // コレクションから全ドキュメントを取得
    const querySnapshot = await ordersRef.get();
    if (querySnapshot.empty) {
      console.log(`該当する注文が見つかりません: token=${token}`);
      return;
    }
    querySnapshot.forEach((doc) => {
      const order = doc.data();
      // マップ内のすべてのフィールドをループして検索
      Object.keys(order).forEach((key) => {
        const orderData = order[key]; // keyは '0', '1', '2' などのインデックス
        if (orderData.token === token) {
          const orderTime = orderData["order-time"];
          const orderDate = orderTime.toDate(); // TimestampをDateに変換
          const formattedOrderTime = orderDate.toISOString(); // DateをISO形式に変換
          // 注文時間が一致するか確認
          if (formattedOrderTime === timestampFromString.toDate().toISOString()) {
            console.log(`一致する注文が見つかりました: ${doc.id}`);
            // 配送状況を更新
            doc.ref.update({ [`${key}.配送状況`]: newStatus }) // インデックス付きで更新
              .then(() => {
                console.log(`配送状況を更新しました: ${newStatus}`);
              })
              .catch((error) => {
                console.log(`配送状況の更新に失敗しました: ${error}`);
              });
          }
        }
      });
    });
  }

  async getUserToken(nickname: string): Promise<string | null> {
    const docRef = admin.firestore().collection("users").doc(nickname);
    const doc = await docRef.get();

    if (doc.exists) {
      return doc.data()?.token || null;
    }
    return null;
  }
}
