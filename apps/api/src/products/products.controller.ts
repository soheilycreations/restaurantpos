import { Controller, Get, Param, Query, Post, Body, Patch, Delete, Headers } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  private getRestaurantId(tenantId: string, queryId: string): string {
    return tenantId || queryId || '16ae97cd-c992-4103-9e58-f7c0671cc29d';
  }

  @Get()
  async findAll(@Headers('x-tenant-id') tenantId: string, @Query('restaurantId') queryId: string) {
    const rId = this.getRestaurantId(tenantId, queryId);
    return this.productsService.findAll(rId);
  }

  @Get('categories')
  async findCategories(@Headers('x-tenant-id') tenantId: string, @Query('restaurantId') queryId: string) {
    const rId = this.getRestaurantId(tenantId, queryId);
    return this.productsService.findCategories(rId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  async createProduct(@Headers('x-tenant-id') tenantId: string, @Query('restaurantId') queryId: string, @Body() data: any) {
    const rId = this.getRestaurantId(tenantId, queryId);
    return this.productsService.createProduct(rId, data);
  }

  @Patch(':id')
  async updateProduct(@Param('id') id: string, @Body() data: any) {
    return this.productsService.updateProduct(id, data);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }

  @Post('categories')
  async createCategory(@Headers('x-tenant-id') tenantId: string, @Query('restaurantId') queryId: string, @Body() data: any) {
    const rId = this.getRestaurantId(tenantId, queryId);
    return this.productsService.createCategory(rId, data);
  }

  @Patch('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.productsService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.productsService.deleteCategory(id);
  }
}
