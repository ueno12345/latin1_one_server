import { Controller, Post, Body } from '@nestjs/common';
import { RegisterService } from './register.service';
import { NotificationsService } from './../notifications/notifications.service';

@Controller('register')
export class RegisterController {
  constructor(private readonly inboxService: RegisterService, private readonly notificationsService: NotificationsService) {}

  @Post('data')
  async registerDataWithReceivedData(
    @Body('category') category: string,
    @Body('title') title: string,
    @Body('body') body: string,
    @Body('image') image: string
  ) {
    try {
      const response = await this.inboxService.registerFirebase(category, title, body, image);
      return { success: true, message: response };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Post('inbox')
  async registerInboxWithReceivedData(
    @Body('topic') topic: string,
    @Body('title') title: string,
    @Body('body') body: string,
    @Body('image') image: string
  ) {
    try {
      const response = await this.inboxService.registerInbox(topic, title, body, image);
      await this.notificationsService.sendWholeNotification(topic, title, body);

      return { success: true, message: response };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
