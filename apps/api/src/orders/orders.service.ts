import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { StockService } from '../inventory/stock.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
    private stockService: StockService
  ) {}

  async createOrder(restaurantId: string, data: any) {
    const order = await this.prisma.order.create({
      data: {
        restaurantId,
        totalAmount: data.totalAmount,
        taxAmount: data.taxAmount || 0,
        discountAmount: data.discountAmount || 0,
        status: data.status || 'PENDING',
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        tableId: data.tableId,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        },
        payment: data.paymentMethod ? {
          create: {
            method: data.paymentMethod,
            amount: data.totalAmount,
            status: 'SUCCESS'
          }
        } : undefined
      },
      include: { 
        items: { include: { product: true } },
        table: true,
        payment: true
      }
    });

    this.eventsGateway.broadcastNewOrder(restaurantId, order);
    
    // Trigger KOT print
    this.eventsGateway.triggerPrint(restaurantId, {
      orderId: order.id,
      items: order.items.map((i: any) => ({ name: i.product?.name || 'Item', quantity: i.quantity })),
      total: order.totalAmount,
      type: 'KOT',
      tableId: order.tableId || undefined
    });

    return order;
  }

  async updateStatus(restaurantId: string, orderId: string, status: any, userId?: string, paymentMethod?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: { include: { product: true } },
        table: true,
        payment: true
      }
    });

    if (!order || order.restaurantId !== restaurantId) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { 
        status,
        payment: (status === 'PAID' && paymentMethod) ? {
          upsert: {
            create: {
              method: paymentMethod,
              amount: order.totalAmount,
              status: 'SUCCESS'
            },
            update: {
              method: paymentMethod,
              amount: order.totalAmount,
              status: 'SUCCESS'
            }
          }
        } : undefined
      },
      include: { 
        items: { include: { product: true } },
        table: true,
        payment: true
      }
    });

    // Handle events
    if (status === 'READY') {
      this.eventsGateway.broadcastOrderReady(restaurantId, updatedOrder);
    }

    // Deduct stock if starting preparation
    if (status === 'IN_PREPARATION' && order.status === 'PENDING') {
      await this.stockService.deductInventoryForOrder(orderId, restaurantId, userId || 'system');
    }

    // Trigger Customer Receipt if paid
    if (status === 'PAID') {
       this.eventsGateway.triggerPrint(restaurantId, {
          orderId: updatedOrder.id,
          items: updatedOrder.items.map((i: any) => ({ name: i.product?.name || 'Item', quantity: i.quantity, price: i.price })),
          total: updatedOrder.totalAmount,
          customerName: updatedOrder.customerName || undefined,
          type: 'CUSTOMER_RECEIPT',
          tableId: updatedOrder.tableId || undefined
       });
    }

    return updatedOrder;
  }

  async getOrders(restaurantId: string) {
    return this.prisma.order.findMany({
      where: { restaurantId },
      include: { 
        items: { include: { product: true } },
        table: true,
        payment: true
      },
      orderBy: { createdAt: 'desc' } // Adding sort by date for better UX
    });
  }
}
