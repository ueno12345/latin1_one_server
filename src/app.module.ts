import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationsController } from './notifications/notifications.controller';
import { FirebaseService } from './firebase/firebase.service';

@Module({
  imports: [],
  controllers: [AppController, NotificationsController],
  providers: [AppService, FirebaseService],
})
export class AppModule {}
