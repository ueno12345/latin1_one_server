import { Controller, Post, Body } from '@nestjs/common';
import { RegisterService } from './register.service';
import { NotificationsService } from './../notifications/notifications.service';

@Controller('register')
export class RegisterController {
  constructor(private readonly registerService: RegisterService,　private readonly inboxService: RegisterService, private readonly notificationsService: NotificationsService) {}

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
  @Post('updateDeliveryStatus')
  async updateDeliveryStatus(
    @Body('token') token: string,
    @Body('product') product: string,
    @Body('timestamp') timestamp: string,
    @Body('newStatus') newStatus: boolean
  ) {
    try {
      await this.registerService.updateDeliveryStatus(token, timestamp, newStatus);
      await this.notificationsService.sendIndividualNotification(token, "商品配送のお知らせ", product+"を配送中です");
      return { success: true, message: "配送状況が更新されました" };
    } catch (error) {
      return { success: false, message: `エラー: ${error.message}` };
    }
  }
}
