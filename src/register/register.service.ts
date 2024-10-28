import { Injectable } from '@nestjs/common';
import { admin } from '@config/firebase';

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
      const hasShopData = item.shopName && item.address && item.phone && item.postalCode && item.openTime && item.closeTime && item.latitude !== undefined && item.longitude !== undefined;

      if (hasShopData) {
        const shop = {
          shopName: item.shopName,
          address: item.address,
          phone: item.phone,
          postalCode: item.postalCode,
          openTime: item.openTime,
          closeTime: item.closeTime,
          latitude: item.latitude,
          longitude: item.longitude,
        };
  
        const shopId = `shop${item.shopName}`; // 店舗名を使ってIDを生成
        const shopRef = firestore.collection('shops-test').doc(shopId);
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
  
        const shopQuerySnapshot = await firestore.collection('shops-test').where('shopName', '==', item.shopName).get();
  
        if (!shopQuerySnapshot.empty) {
          shopQuerySnapshot.forEach((shopDoc) => {
            const shopId = shopDoc.id; // 店舗のIDを取得
            const productRef = firestore.collection('shops-test').doc(shopId).collection('products').doc(); // 自動生成されたID
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
}
