import { Injectable } from '@nestjs/common';
import { admin } from '@config/firebase';

@Injectable()
export class NotificationsService {
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
