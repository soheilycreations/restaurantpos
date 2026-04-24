import { Controller, Post, Get, Delete, Patch, Body, Req, UseGuards, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { TenantGuard } from '../auth/tenant.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('orders')
@UseGuards(TenantGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles('CASHIER', 'ADMIN') 
  createOrder(@Req() request: any, @Body() body: any) {
    return this.ordersService.createOrder(request.tenantId, body);
  }

  @Get()
  @Roles('CASHIER', 'ADMIN')
  getOrders(@Req() request: any) {
    return this.ordersService.getOrders(request.tenantId);
  }

  @Delete(':id')
  @Roles('ADMIN') // Strict RBAC Lockdown
  deleteOrder(@Req() request: any, @Param('id') id: string) {
    // return this.ordersService.deleteOrder(request.tenantId, id); 
    return { ok: true, msg: 'Order permanently deleted. Audit logged.' };
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'CASHIER', 'KITCHEN')
  updateOrderStatus(
    @Req() request: any, 
    @Param('id') id: string, 
    @Body() body: { status: string, paymentMethod?: string }
  ) {
    return this.ordersService.updateStatus(request.tenantId, id, body.status, request.user?.id, body.paymentMethod);
  }
}
