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
    //  const data = await this.acquireService.getDataFromFirebase(collectionId);

      const result = await this.acquireService.getDataFromFirebase(collectionId, documentId, subCollectionId);

      return { success: true, data: result };
    } catch (error) {
      console.error("Error in AcquireService:", error);
      return { success: false, message: error.message };
    }
  }
}
