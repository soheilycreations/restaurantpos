import { 
  Controller, Post, UseInterceptors, 
  UploadedFile, BadRequestException, Body 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '../prisma/prisma.service';
import * as xlsx from 'xlsx';

@Controller('import')
export class ImportController {
  constructor(private prisma: PrismaService) {}

  @Post('excel')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(
    @UploadedFile() file: any,
    @Body('restaurantId') restaurantId: string
  ) {
    if (!file || !restaurantId) {
      throw new BadRequestException('File and Restaurant ID are required');
    }

    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[] = xlsx.utils.sheet_to_json(sheet);

    let importedCount = 0;
    const categories: Record<string, string> = {};

    for (const row of data) {
      const name = row['Name'] || row['Item Name'];
      const price = parseFloat(row['Price'] || row['Selling Price'] || 0);
      const catName = row['Category'] || 'Other';

      if (!name) continue;

      // Ensure Category exists
      if (!categories[catName]) {
        let category = await this.prisma.category.findFirst({
          where: { name: catName, restaurantId }
        });
        if (!category) {
          category = await this.prisma.category.create({
            data: { name: catName, restaurantId }
          });
        }
        categories[catName] = category.id;
      }

      // Create Product
      await this.prisma.product.create({
        data: {
          name,
          price,
          categoryId: categories[catName],
          restaurantId,
          description: `Imported from Excel. Code: ${row['Code'] || ''}`,
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'
        }
      });
      importedCount++;
    }

    return { success: true, count: importedCount };
  }
}
