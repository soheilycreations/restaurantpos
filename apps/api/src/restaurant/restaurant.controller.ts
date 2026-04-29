import { Controller, Get, Patch, Body, UseGuards, Req, Post, Param } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get('all')
  findAll() {
    return this.restaurantService.findAll();
  }

  @Post()
  create(@Body() data: any) {
    return this.restaurantService.create(data);
  }

  @Get()
  @UseGuards(TenantGuard)
  getSettings(@Req() req: any) {
    return this.restaurantService.getSettings(req.tenantId);
  }

  @Get('ping')
  ping() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Patch(':id')
  updateById(@Param('id') id: string, @Body() data: any) {
    return this.restaurantService.updateSettings(id, data);
  }

  @Patch()
  @UseGuards(TenantGuard)
  updateSettings(@Req() req: any, @Body() data: any) {
    return this.restaurantService.updateSettings(req.tenantId, data);
  }
}
