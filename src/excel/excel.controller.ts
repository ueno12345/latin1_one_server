import { Controller, Post, Body, Res, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelService } from './excel.service';
import { RegisterService } from './../register/register.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService, private readonly registerService: RegisterService) {}

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

      // アップロードされたファイルを一時的に保存
      const tempFilePath = path.join(__dirname, '..', '..', 'uploads', file.originalname); // ファイル名を追加
      fs.writeFileSync(tempFilePath, file.buffer); // bufferからファイルを作成

      try {
        // Excelファイルを解析してFirestoreに登録
        const Data = await this.excelService.parseExcel(tempFilePath); // 解析
        console.log('登録処理中です・・・');
        await this.registerService.registerToFirestore(Data); // 登録
      } catch (error) {
        console.error('Error during Excel processing:', error);
        // エラーが発生した場合は、一時ファイルを削除
        fs.unlinkSync(tempFilePath);
        return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Excelの処理中にエラーが発生しました' };
      }

      // 一時ファイルを削除
      try {
        fs.unlinkSync(tempFilePath);
      } catch (error) {
        console.error('Error deleting temporary file:', error);
      }

      return { statusCode: HttpStatus.OK, message: 'ファイルアップロード成功' };
    } else {
      console.error('ファイルがアップロードされていません');
      return { statusCode: HttpStatus.BAD_REQUEST, message: 'ファイルがアップロードされていません' };
    }
  }
}
