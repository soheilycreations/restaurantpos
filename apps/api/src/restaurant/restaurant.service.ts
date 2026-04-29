import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RestaurantService {
  constructor(private prisma: PrismaService) {}

  async getSettings(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  async updateSettings(restaurantId: string, data: any) {
    return this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        logoUrl: data.logoUrl,
        primaryColor: data.primaryColor,
        printLogo: data.printLogo,
        managerCode: data.managerCode,
      },
    });
  }

  async findAll() {
    return this.prisma.restaurant.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: any) {
    return this.prisma.restaurant.create({
      data: {
        name: data.name,
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        managerCode: data.managerCode || '8888',
      }
    });
  }
}
