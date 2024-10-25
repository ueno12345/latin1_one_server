import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import { readFile } from 'fs/promises';

@Injectable()
export class NotificationsService {
  constructor() {
    this.initializeFirebase();
  }

  // Firebaseの初期化処理
  private async initializeFirebase() {
    try {
      // serviceAccountKey.jsonのパスを取得
      const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

      // serviceAccountKey.jsonを非同期に読み込む
      const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf-8'));

      // Firebaseの初期化
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      throw new Error(`Firebase initialization error: ${error.message}`);
    }
  }

  // メッセージ内容を動的に受け取り、通知を送信
  async sendWholeNotification(
    topic: string,
    title: string,
    body: string,
  ): Promise<string> {
    try {
      const message: admin.messaging.Message = {
        notification: {
          title,
          body,
        },
        topic: topic,
      };

      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      throw new Error(`Error sending message: ${error.message}`);
    }
  }

  async sendIndividualNotification(
    token: string,
    title: string,
    body: string,
  ): Promise<string> {
    try {
      const message: admin.messaging.Message = {
        notification: {
          title,
          body,
        },
        token: token,
      };

      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      throw new Error(`Error sending message: ${error.message}`);
    }
  }
}
