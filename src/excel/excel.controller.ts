import { Controller, Get, Post, Res, UseInterceptors, UploadedFile, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelService } from './excel.service';
import { Response } from 'express';

@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Get('download')
  async downloadExcel(@Res() res: Response) {
    console.log('ダウンロードリクエストを受信しました'); // ログ追加
    await this.excelService.generateExcelFile(res);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('ファイルアップロードリクエストを受信しました'); // ログ追加
    if (file) {
      console.log('アップロードされたファイル:', file.originalname);
      await this.excelService.saveUploadedFile(file);
      return { statusCode: HttpStatus.OK, message: 'ファイルアップロード成功' };
    } else {
      console.error('ファイルがアップロードされていません');
      return { statusCode: HttpStatus.BAD_REQUEST, message: 'ファイルがアップロードされていません' };
    }
  }
}
