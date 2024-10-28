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
        { header: '店舗名', key: 'shopName', width: 32 },
        { header: '住所', key: 'address', width: 32 },
        { header: '電話番号', key: 'phoneNumber', width: 32 },
        { header: '郵便番号', key: 'postCode', width: 32 },
        { header: '開店時間(OPEN)', key: 'open', width: 32 },
        { header: '閉店時間(CLOSE)', key: 'close', width: 32 },
        { header: '緯度', key: 'latitude', width: 32 },
        { header: '経度', key: 'longitude', width: 32 },
      ];
//      worksheet.addRow({ shopName: 'Sample Name', address: 'address', phoneNumber: 'XXX-XXX-XXXX', postCode: '〒XXX-XXXX', open: '8:30', close: '18:00', latitude: 'XX.XXXX', longitude: 'XX.XXXXX' });
//      worksheet.addRow({ shopName: 'Sample Name', address: 'address', phoneNumber: 'XXX-XXX-XXXX', postCode: '〒XXX-XXXX', open: '10:00', close: '17:00', latitude: 'XX.XXXX', longitude: 'XX.XXXXX' });
    } else if (dataType === 'product') {
      worksheet.columns = [
        { header: '店舗名', key: 'shopName', width: 32 },
        { header: '商品名', key: 'productName', width: 32 },
        { header: '説明', key: 'description', width: 50 },
        { header: '価格', key: 'price', width: 10 },
        { header: '商品の分類', key: 'productType', width: 50 },
        { header: 'カテゴリー', key: 'category', width: 50 },
        { header: '原産国', key: 'countryOfOrigin', width: 20 },
        { header: '画像へのパス', key: 'image', width: 20 },
      ];
//      worksheet.addRow({shopName: 'JAVANICAN', productName: 'Sample Product A', description: '甘い風味とまろやかで極上の味わい', price: 1000, productType: "beans", category: 'SPECIALTY COFFEE MEDIUM ROAST', countryOfOrigin: 'KENYA', image: 'image/image1.jpg' });
//      worksheet.addRow({shopName: 'JAVANICAN', productName: 'Sample Product B', description: '甘い風味と柔らかな味わい，上品な酸味', price: 1500, productType: "beans", category: '究極の BLEND COFFEE', countryOfOrigin: 'unknown', image: 'image/image1.jpg' });
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

  async parseExcel(filePath: string): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.getWorksheet(1);
    const data = [];

    // ヘッダー行を取得
    const headers = worksheet.getRow(1).values as string[];

   // 店舗データか商品データかを判断
    const hasShopColumns = headers.includes('店舗名') && headers.includes('住所') && headers.includes('電話番号') && headers.includes('郵便番号') && headers.includes('開店時間(OPEN)') && headers.includes('閉店時間(CLOSE)') && headers.includes('緯度') && headers.includes('経度');
    const hasProductColumns = headers.includes('店舗名') && headers.includes('商品名') && headers.includes('説明') && headers.includes('価格') && headers.includes('商品の分類') && headers.includes('カテゴリー') && headers.includes('原産国') && headers.includes('画像へのパス');


    // 店舗データか商品データかを判断
    if (hasProductColumns) {
      // 商品データを処理
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // ヘッダー行をスキップ
        const [, shopName, productName, description, price, productType, category, countryOfOrigin, imagePath] = row.values as any[];

        data.push({
          shopName: shopName as string,
          productName: productName as string,
          description: description as string,
          price: price as number,
          productType: productType as string,
          category: category as string,
          countryOfOrigin: countryOfOrigin as string,
          imagePath: imagePath as string,
        });
      });
    } else if (hasShopColumns) {
      // 店舗データを処理
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // ヘッダー行をスキップ
        const [, shopName, address, phone, postalCode, openTime, closeTime, latitude, longitude] = row.values as any[];

        data.push({
          shopName: shopName as string,
          address: address as string,
          phone: phone as string,
          postalCode: postalCode as string,
          openTime: openTime as string,
          closeTime: closeTime as string,
          latitude: latitude as number,
          longitude: longitude as number,
        });
      });
    } else {
      throw new Error('不明なデータ形式です。店舗データまたは商品データを含む必要があります。');
    }

    return data; // 取得したデータを返す
  }
}
