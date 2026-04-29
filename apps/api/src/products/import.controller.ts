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
    console.log(`Excel data parsed: ${data.length} rows found`);

    // 1. Pre-fetch existing categories
    const existingCategories = await this.prisma.category.findMany({
      where: { restaurantId }
    });
    const categoryMap: Record<string, string> = {};
    existingCategories.forEach(cat => categoryMap[cat.name] = cat.id);

    // 2. Identify unique new categories
    const uniqueCatNames = Array.from(new Set(data.map(row => row['Category'] || row['category'] || row['Type'] || 'Other')));
    for (const catName of uniqueCatNames) {
      if (!categoryMap[catName]) {
        const newCat = await this.prisma.category.create({
          data: { name: catName, restaurantId }
        });
        categoryMap[catName] = newCat.id;
      }
    }

    // 3. Prepare products for batch creation
    const productsToCreate = data.map(row => {
      const name = row['Product name'] || row['Name'] || row['Item Name'] || row['item'] || row['Item'] || row['NAME'];
      const priceRaw = row['Unit price'] || row['Price'] || row['Selling Price'] || row['price'] || row['Rate'] || row['amount'] || 0;
      const price = parseFloat(priceRaw.toString());
      const catName = row['Category'] || row['category'] || row['Type'] || 'Other';

      if (!name) return null;

      return {
        name: name.toString().trim(),
        price,
        categoryId: categoryMap[catName],
        restaurantId,
        description: `Imported from Excel.`,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'
      };
    }).filter(p => p !== null);

    // 4. Batch create products
    if (productsToCreate.length > 0) {
      await this.prisma.product.createMany({
        data: productsToCreate as any,
        skipDuplicates: true
      });
    }

    console.log(`Import completed: ${productsToCreate.length} items added.`);
    return { success: true, count: productsToCreate.length };
  }
}
