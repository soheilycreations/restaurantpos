import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Headers } from '@nestjs/common';
import { TablesService } from './tables.service';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  private getRestaurantId(tenantId: string, queryId: string): string {
    return tenantId || queryId || '16ae97cd-c992-4103-9e58-f7c0671cc29d';
  }

  @Post()
  create(@Headers('x-tenant-id') tenantId: string, @Query('restaurantId') queryRestaurantId: string, @Body() data: any) {
    const rId = this.getRestaurantId(tenantId, queryRestaurantId);
    return this.tablesService.create(rId, data);
  }

  @Get()
  findAll(@Headers('x-tenant-id') tenantId: string, @Query('restaurantId') queryRestaurantId: string) {
    const rId = this.getRestaurantId(tenantId, queryRestaurantId);
    return this.tablesService.findAll(rId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tablesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.tablesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tablesService.remove(id);
  }
}
