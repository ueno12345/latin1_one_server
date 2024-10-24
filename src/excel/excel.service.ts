import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ExcelService {
  async generateExcelFile(res: Response) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    // データを追加
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: '名前', key: 'name', width: 32 },
      { header: '年齢', key: 'age', width: 10 }
    ];
    worksheet.addRow({ id: 1, name: 'John Doe', age: 29 });

    // レスポンスヘッダーを設定し、Excelファイルを送信
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=example.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  }

  async saveUploadedFile(file: Express.Multer.File) {
    const uploadPath = './uploads'; // 保存先ディレクトリ

    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }

    // ファイルを指定のパスに保存
    const filePath = path.join(uploadPath, file.originalname);
    fs.writeFileSync(filePath, file.buffer);
  }
}
