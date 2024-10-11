import { Controller, Post, Body } from '@nestjs/common';
import { InboxService } from './inbox.service';

@Controller('inbox')
export class InboxController {
//  constructor(private readonly inboxService: InboxService) {}
//
//  @Post('send')
//  async sendInbox(
//    @Body('date') date: string,
//    @Body('title') title: string,
//    @Body('description') description: string,
//    @Body('image') image: string
//  ) {
//    try {
//      const response = await this.inboxService.registFirebase(date, title, description, image);
//      return { success: true, message: response };
//    } catch (error) {
//      return { success: false, message: error.message };
//    }
//  }
}
