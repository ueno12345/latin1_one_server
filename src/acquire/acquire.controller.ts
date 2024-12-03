import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AcquireService } from './acquire.service';

@Controller('acquire')
export class AcquireController {
  constructor(private readonly acquireService: AcquireService) {}

  @Post('data')
  async getNestedData(
    @Body() body: { collectionId: string; documentId: string; subCollectionId?: string; subDocumentId?: string }
  ): Promise<any> {
    const { collectionId, documentId, subCollectionId, subDocumentId } = body;

    if (!collectionId || !documentId) {
      throw new HttpException('ID が不足しています', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.acquireService.getDataFromFirebase(collectionId, documentId, subCollectionId);

      return { success: true, data: result };
    } catch (error) {
      console.error("Error in AcquireService:", error);
      return { success: false, message: error.message };
    }
  }

  @Post('order')
  async getOrderData(
    @Body() body: { shop: string;}
  ): Promise<any> {
    const { shop } = body;

    if (!shop) {
      throw new HttpException('店舗情報 が不足しています', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.acquireService.getDataFromFirebase("order", shop);
      const data = await this.acquireService.flattenData(result);

      return { success: true, data: data };
    } catch (error) {
      console.error("Error in AcquireService:", error);
      return { success: false, message: error.message };
    }
  }
}
