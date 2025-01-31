import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsService } from './notifications/notifications.service';
import { RegisterController } from './register/register.controller';
import { RegisterService } from './register/register.service';
import { ExcelService } from './excel/excel.service';
import { ExcelController } from './excel/excel.controller';
import { AcquireController } from './acquire/acquire.controller';
import { AcquireService } from './acquire/acquire.service';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public', 'build'),
      serveRoot: '/',
    }),
  ],
  controllers: [AppController, NotificationsController, RegisterController, ExcelController, AcquireController],
  providers: [AppService, NotificationsService, RegisterService, ExcelService, AcquireService],
})
export class AppModule {}
