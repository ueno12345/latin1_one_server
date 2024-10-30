import { Controller, Post, Body, Res, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelService } from './excel.service';
import { AcquireService } from './../acquire/acquire.service';
import { RegisterService } from './../register/register.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService, private readonly acquireService: AcquireService, private readonly registerService: RegisterService) {}

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

    try {
      if (dataType === 'shop') {
        // Firebaseからデータを取得
        const data = await this.acquireService.getDataFromFirebase("shops");
        // データが見つからない場合の処理
        if (!data) {
          throw new HttpException('データが見つかりません', HttpStatus.NOT_FOUND);
        }
        await this.excelService.generateExcelFile(res, dataType, data); // ここを修正
      } else if (dataType === 'product') {
        const data = await this.acquireService.getDataFromFirebase("shops", "JAVANICAN", "products");
        if (!data) {
          throw new HttpException('データが見つかりません', HttpStatus.NOT_FOUND);
        }
        await this.excelService.generateExcelFile(res, dataType, data); // ここはそのまま
      } else {
        throw new HttpException('不正なデータ形式です', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.error('Error during downloadExcel:', error);
      throw new HttpException(`エラーが発生しました: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
//  async downloadExcel(
//    @Body() body: { dataType: 'shop' | 'product' },
//    @Res() res: Response,
//  ) {
//    const { dataType } = body;
//
//    if (!dataType) {
//      throw new HttpException('データの種類が指定されていません', HttpStatus.BAD_REQUEST);
//    }
//
//    console.log(`ダウンロードリクエストを受信しました - データの種類: ${dataType}`);
//    await this.excelService.generateExcelFile(res, dataType);
//  }

@Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log('ファイルアップロードリクエストを受信しました');

    if (!file) {
      console.error('ファイルがアップロードされていません');
      return { statusCode: HttpStatus.BAD_REQUEST, message: 'ファイルがアップロードされていません' };
    }

    console.log('アップロードされたファイル:', file.originalname);

    // アップロードされたファイルをuploadsディレクトリに保存
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    const tempFilePath = path.join(uploadsDir, file.originalname);

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // ファイルを保存
    fs.writeFileSync(tempFilePath, file.buffer);

    try {
      // Excelファイルを解析してFirestoreに登録
      const Data = await this.excelService.parseExcel(tempFilePath);
      console.log('登録処理中です・・・');
      await this.registerService.registerToFirestore(Data);
      console.log('登録が完了しました');
    } catch (error) {
      console.error('Excelの処理中にエラーが発生しました:', error);
      fs.unlinkSync(tempFilePath); // エラー発生時は一時ファイルを削除
      return { statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Excelの処理中にエラーが発生しました' };
    }

//    // 処理後のファイル削除
//    try {
//      fs.unlinkSync(tempFilePath);
//    } catch (error) {
//      console.error('一時ファイルの削除中にエラーが発生しました:', error);
//    }

    return { statusCode: HttpStatus.OK, message: 'ファイルのアップロードに成功しました' };
  }
}
