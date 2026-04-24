import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { TenantGuard } from '../auth/tenant.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('analytics')
@UseGuards(TenantGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @Roles('ADMIN')
  getSummary(@Req() request: any) {
    return this.analyticsService.getDashboardSummary(request.tenantId);
  }

  @Get('sales-trend')
  @Roles('ADMIN')
  getSalesTrend(@Req() request: any) {
    return this.analyticsService.getSalesTrend(request.tenantId);
  }

  @Get('category-split')
  @Roles('ADMIN')
  getCategorySplit(@Req() request: any) {
    return this.analyticsService.getCategorySplit(request.tenantId);
  }

  @Get('recent-items')
  @Roles('ADMIN')
  getRecentItems(@Req() request: any) {
    return this.analyticsService.getRecentStats(request.tenantId);
  }
}
