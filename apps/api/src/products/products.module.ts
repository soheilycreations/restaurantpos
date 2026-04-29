import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { UploadController } from './upload.controller';
import { ImportController } from './import.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController, UploadController, ImportController],
  providers: [ProductsService],
  exports: [ProductsService]
})
export class ProductsModule {}
