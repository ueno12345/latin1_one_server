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
//      // serviceAccountKey.jsonのパスを取得
//      const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');
//
//      // serviceAccountKey.jsonを非同期に読み込む
//      const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf-8'));
//
//      // Firebaseの初期化
//      admin.initializeApp({
//        credential: admin.credential.cert(serviceAccount),
//      });
//    } catch (error) {
//      throw new Error(`Firebase initialization error: ${error.message}`);
//    }
//  }

  private async addDataToFirestore(collectionId: string, documentId: string, data: { [key: string]: any }) {
    const db = admin.firestore();
    const docRef = db.collection(collectionId).doc(documentId);

    // ドキュメントを追加
    await docRef.set(data);
    console.log(`Added document with ID: ${documentId}`);
  }

  // Firebaseにデータを登録する処理
  async registerFirebase(
    category: string,
    title: string,
    body: string,
    image: string
  ): Promise<void> {
    try {
      // 現在の日付をISO 8601形式で取得
      const date = new Date().toISOString().split('T')[0];

      // 登録するデータ
      const data = {
        date,
        title,
        body,
        image,
      };

      // Firestoreにデータを追加
      await this.addDataToFirestore("tests", "documnenttest", data);
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
      // 現在の日付をISO 8601形式で取得
      const date = new Date().toISOString().split('T')[0];

      // 登録するデータ
      const data = {
        date,
        topic,
        title,
        body,
        image,
      };

      // FirestoreのInboxにデータを追加
      await this.addDataToFirestore("inbox", "information", data);
      console.log('Data added successfully');
    } catch (error) {
      console.error('Error adding data:', error);
    }
  }
}
