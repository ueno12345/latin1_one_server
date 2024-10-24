import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import { readFile } from 'fs/promises';

@Injectable()
export class RegisterService {
//  constructor() {
//    this.initializeFirebase();
//  }
//
//  // Firebaseの初期化処理
//  private async initializeFirebase() {
//    try {
//      if (admin.apps.length === 0) {
//        const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');
//        const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf-8'));
//
//        admin.initializeApp({
//          credential: admin.credential.cert(serviceAccount),
//        });
//      }
//    } catch (error) {
//      throw new Error(`Firebase initialization error: ${error.message}`);
//    }
//  }

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
        [`${category}_${uniqueId}`]: {
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
}
