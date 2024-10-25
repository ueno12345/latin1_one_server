import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ExcelService {
  async generateExcelFile(res: Response, dataType: 'shop' | 'product') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    if (dataType === 'shop') {
      worksheet.columns = [
        { header: '店舗名', key: 'name', width: 32 },
        { header: '住所', key: 'address', width: 32 },
        { header: '電話番号', key: 'phoneNumber', width: 32 },
        { header: '郵便番号', key: 'postCode', width: 32 },
        { header: '開店時間(OPEN)', key: 'open', width: 32 },
        { header: '閉店時間(CLOSE)', key: 'close', width: 32 },
        { header: '緯度', key: 'latitude', width: 32 },
        { header: '経度', key: 'longitude', width: 32 },
      ];
      worksheet.addRow({ name: 'Sample Name', address: 'address', phoneNumber: 'XXX-XXX-XXXX', postCode: '〒XXX-XXXX', open: '8:30', close: '18:00', latitude: 'XX.XXXX', longitude: 'XX.XXXXX' });
      worksheet.addRow({ name: 'Sample Name', address: 'address', phoneNumber: 'XXX-XXX-XXXX', postCode: '〒XXX-XXXX', open: '10:00', close: '17:00', latitude: 'XX.XXXX', longitude: 'XX.XXXXX' });
    } else if (dataType === 'product') {
      worksheet.columns = [
        { header: '商品名', key: 'name', width: 32 },
        { header: '説明', key: 'description', width: 50 },
        { header: '価格', key: 'price', width: 10 },
        { header: 'カテゴリー', key: 'category', width: 50 },
        { header: '原産国', key: 'country', width: 20 },
        { header: '画像へのパス', key: 'image', width: 20 },
      ];
      worksheet.addRow({name: 'Sample Product A', description: '甘い風味とまろやかで極上の味わい', price: 1000, category: 'SPECIALTY COFFEE MEDIUM ROAST', country: 'KENYA', image: 'image/image1.jpg' });
      worksheet.addRow({name: 'Sample Product B', description: '甘い風味と柔らかな味わい，上品な酸味', price: 1500, category: '究極の BLEND COFFEE', country: 'unknown', image: 'image/image1.jpg' });
    }

    // レスポンスヘッダーを設定し、Excelファイルを送信
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${dataType}_data.xlsx`);
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
