import { Injectable } from '@nestjs/common';
import { admin } from '@config/firebase';

@Injectable()
export class AcquireService {
//  private convertToPlainText(data: any): any {
//    const convertedData: any = {};
//
//    for (const [key, value] of Object.entries(data || {})) {
//      if (value && value.richText) {
//        // リッチテキストがある場合、テキスト部分だけを取得
//        convertedData[key] = value.richText.map((part: any) => part.text).join('');
//      } else {
//        // プレーンテキストの場合はそのまま使用
//        convertedData[key] = value;
//      }
//    }
//
//    return convertedData;
//  }

  async getDataFromFirebase(
    collectionId: string,
    documentId?: string,
    subCollectionId?: string
  ): Promise<any[]> {
    const db = admin.firestore();
    try {
      // 結果を格納する配列
      const result = [];

      if (documentId && subCollectionId) {
        // collectionId + documentId + subCollectionId が指定された場合
        const subCollectionSnapshot = await db
          .collection(collectionId)
          .doc(documentId)
          .collection(subCollectionId)
          .get();

        if (subCollectionSnapshot.empty) {
          console.log(`サブコレクション ${subCollectionId} は存在しません (ドキュメントID: ${documentId})`);
          return [];
        }

        // サブコレクション内のすべてのドキュメントを取得
        subCollectionSnapshot.forEach((subDoc) => {
          result.push({ subDocumentId: subDoc.id, data: subDoc.data() });
        });
      } else if (documentId && !subCollectionId) {
        // collectionId + documentId のみが指定された場合
        const documentSnapshot = await db
          .collection(collectionId)
          .doc(documentId)
          .get();

        if (!documentSnapshot.exists) {
          console.log(`ドキュメント ${documentId} は存在しません (コレクション: ${collectionId})`);
          return [];
        }

        // 指定されたドキュメントのデータを取得
        result.push({ documentId: documentSnapshot.id, data: documentSnapshot.data() });
      } else if (collectionId && !documentId && !subCollectionId) {
        // collectionId のみが指定された場合
        const collectionSnapshot = await db.collection(collectionId).get();

        if (collectionSnapshot.empty) {
          console.log(`コレクション ${collectionId} は存在しません`);
          return [];
        }

        // コレクション内のすべてのドキュメントを取得
        collectionSnapshot.forEach((doc) => {
          result.push({ documentId: doc.id, data: doc.data() });
        });
      } else {
        console.log('無効なパラメータです。collectionId または collectionId + documentId + subCollectionId のみ指定してください。');
        return [];
      }
      return result;
    } catch (error) {
      console.error('データ取得中にエラーが発生しました:', error);
      throw new Error(`データ取得に失敗しました: ${error.message}`);
    }
  }
  // UNIXタイムスタンプを整形する関数
  private formatTimestamp(sec: number): string {
    const date = new Date(sec * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}年${month}月${day}日${hours}時${minutes}分${seconds}秒`;
  }

  // データを平坦化する関数
  flattenData(data: any[]): any[] {
    return data.flatMap((doc) => {
      return Object.values(doc.data || {}).map((order: any) => {
        if (order['配送状況'] === false) {
          const formattedOrderItems = order['注文商品']
            .map((item: any) => `${item.name}×${item.pieces}`)
            .join('，');
          const formattedTotal = `${order['注文合計']}円`;
          return {
            ...order,
            '注文商品': formattedOrderItems,
            '注文合計': formattedTotal,
            'order-time': this.formatTimestamp(order['order-time']._seconds),
            'token': order['token'] || '',
          };
        }
        return {};
      }).filter(order => Object.keys(order).length > 0);
    });
  }
}
