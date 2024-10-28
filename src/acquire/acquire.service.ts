import { Injectable } from '@nestjs/common';
import { admin } from '@config/firebase';

@Injectable()
export class AcquireService {
  async getNestedDataFromFirebase(
    collectionId: string,
    documentId: string,
    subCollectionId?: string,
    subDocumentId?: string
  ): Promise<any | undefined> {
    const db = admin.firestore();

    try {
      // 最初のコレクションとドキュメントを取得
      const docRef = db.collection(collectionId).doc(documentId);
      const docSnapshot = await docRef.get();

      if (!docSnapshot.exists) {
        console.log(`Document ${documentId} does not exist in collection ${collectionId}`);
        return undefined;
      }

      // サブドキュメントが指定されている場合
      if (subCollectionId && subDocumentId) {
        const subDocRef = docRef.collection(subCollectionId).doc(subDocumentId);
        const subDocSnapshot = await subDocRef.get();

        if (subDocSnapshot.exists) {
          return subDocSnapshot.data(); // サブドキュメントのデータを返す
        } else {
          console.log(`Sub-document ${subDocumentId} does not exist in sub-collection ${subCollectionId}`);
          return undefined;
        }
      }

      // subCollectionId または subDocumentId がない場合、最上位のドキュメントデータを返す
      return docSnapshot.data();
    } catch (error) {
      console.error('Error retrieving nested data:', error);
      throw new Error(`Failed to retrieve nested data: ${error.message}`);
    }
  }
}
