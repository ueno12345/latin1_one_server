import { Controller, Post, Body } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post('send')
  async sendNotification(
    @Body('token') token: string,
    @Body('title') title: string,
    @Body('body') body: string,
    @Body('data') data: Record<string, string>
  ) {
    try {
      const response = await this.firebaseService.sendNotification(token, title, body, data);
      return { success: true, message: response };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
