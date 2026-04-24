import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { TenantGuard } from '../auth/tenant.guard';

@Controller('restaurant')
@UseGuards(TenantGuard)
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Get()
  getSettings(@Req() req: any) {
    return this.restaurantService.getSettings(req.tenantId);
  }

  @Get('ping')
  ping() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Patch()
  updateSettings(@Req() req: any, @Body() data: any) {
    return this.restaurantService.updateSettings(req.tenantId, data);
  }
}
