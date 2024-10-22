import { Controller, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('whole')
  async sendNotificationWithReceivedData(
    @Body('token') token: string,
    @Body('title') title: string,
    @Body('body') body: string,
    @Body('data') data: Record<string, string>
  ) {
    try {
      const response = await this.notificationsService.sendWholeNotification(token, title, body, data);
      return { success: true, message: response };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('individual')
  async sendNotificationIndividuallyWithReceivedData(
    @Body('topic') topic: string,
    @Body('title') title: string,
    @Body('body') body: string,
    @Body('data') data: Record<string, string>
  ) {
    try {
      const response = await this.notificationsService.sendIndividualNotification(topic, title, body, data);
      return { success: true, message: response };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
