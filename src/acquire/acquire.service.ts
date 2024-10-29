import { Injectable } from '@nestjs/common';
import { admin } from '@config/firebase';

@Injectable()
export class AcquireService {
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
}
