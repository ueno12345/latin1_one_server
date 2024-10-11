import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsService } from './notifications/notifications.service';
import { InboxController } from './inbox/inbox.controller';
import { InboxService } from './inbox/inbox.service';
@Module({
  imports: [],
  controllers: [AppController, NotificationsController, InboxController],
  providers: [AppService, NotificationsService, InboxService],
})
export class AppModule {}
