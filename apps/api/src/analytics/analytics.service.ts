import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardSummary(restaurantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Today's Sales
    const daySales = await this.prisma.order.aggregate({
      where: {
        restaurantId,
        createdAt: { gte: today },
        status: { in: ['PAID', 'READY', 'DELIVERED'] }
      },
      _sum: {
        totalAmount: true
      }
    });

    // 2. Active Orders (Tables busy)
    const activeOrdersCount = await this.prisma.order.count({
      where: {
        restaurantId,
        status: { in: ['PENDING', 'IN_PREPARATION', 'READY'] }
      }
    });

    // 3. Menu Items Count
    const productCount = await this.prisma.product.count({
      where: { restaurantId }
    });

    // 4. Daily Footfall (Orders created today)
    const todayOrdersCount = await this.prisma.order.count({
      where: {
        restaurantId,
        createdAt: { gte: today }
      }
    });

    // 5. Yesterday's Sales for growth trend
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdaySales = await this.prisma.order.aggregate({
      where: {
        restaurantId,
        createdAt: { gte: yesterday, lt: today },
        status: { in: ['PAID', 'READY', 'DELIVERED'] }
      },
      _sum: {
        totalAmount: true
      }
    });

    const todaySalesAmount = daySales._sum.totalAmount || 0;
    const yesterdaySalesAmount = yesterdaySales._sum.totalAmount || 0;
    const growth = yesterdaySalesAmount > 0 
      ? ((todaySalesAmount - yesterdaySalesAmount) / yesterdaySalesAmount) * 100 
      : 0;

    return {
      todaySales: todaySalesAmount,
      activeOrders: activeOrdersCount,
      menuItems: productCount,
      todayGuests: todayOrdersCount, // Using order count as proxy for guests
      salesGrowth: growth.toFixed(1)
    };
  }

  async getSalesTrend(restaurantId: string) {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      dates.push(d);
    }

    const chartData = await Promise.all(
      dates.map(async (date) => {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const sales = await this.prisma.order.aggregate({
          where: {
            restaurantId,
            createdAt: { gte: date, lt: nextDate },
            status: { in: ['PAID', 'READY', 'DELIVERED'] }
          },
          _sum: {
            totalAmount: true
          }
        });

        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        return {
          name: dayName,
          sales: sales._sum.totalAmount || 0
        };
      })
    );

    return chartData;
  }

  async getCategorySplit(restaurantId: string) {
    const categories = await this.prisma.category.findMany({
      where: { restaurantId },
      include: {
        products: {
          include: {
            orderItems: {
               include: {
                  order: true
               }
            }
          }
        }
      }
    });

    const split = categories.map(cat => {
      let totalRevenue = 0;
      cat.products.forEach(prod => {
        prod.orderItems.forEach(item => {
          if (['PAID', 'READY', 'DELIVERED'].includes(item.order.status)) {
            totalRevenue += item.price * item.quantity;
          }
        });
      });
      return {
        name: cat.name,
        value: totalRevenue
      };
    }).filter(c => c.value > 0);

    // Calculate percentages
    const grandTotal = split.reduce((acc, curr) => acc + curr.value, 0);
    const result = split.map(s => ({
      ...s,
      percentage: grandTotal > 0 ? Math.round((s.value / grandTotal) * 100) : 0
    }));

    return result.sort((a, b) => b.value - a.value);
  }

  async getRecentStats(restaurantId: string) {
     return this.prisma.product.findMany({
        where: { restaurantId },
        include: { category: true },
        take: 5,
        orderBy: { updatedAt: 'desc' }
     });
  }
}
