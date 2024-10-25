import { Controller, Post, Body, Res, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelService } from './excel.service';
import { Response } from 'express';

@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Post('download')
  async downloadExcel(
    @Body() body: { dataType: 'shop' | 'product' },
    @Res() res: Response,
  ) {
    const { dataType } = body;

    if (!dataType) {
      throw new HttpException('データの種類が指定されていません', HttpStatus.BAD_REQUEST);
    }

    console.log(`ダウンロードリクエストを受信しました - データの種類: ${dataType}`);
    await this.excelService.generateExcelFile(res, dataType);
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
