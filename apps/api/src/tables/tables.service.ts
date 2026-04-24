import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async findAll(restaurantId: string) {
    return this.prisma.table.findMany({
      where: { restaurantId },
      orderBy: { number: 'asc' },
    });
  }

  async findOne(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
    });
    if (!table) throw new NotFoundException('Table not found');
    return table;
  }

  async create(restaurantId: string, data: any) {
    return this.prisma.table.create({
      data: {
        number: parseInt(data.number, 10),
        capacity: parseInt(data.capacity, 10),
        status: data.status || 'AVAILABLE',
        restaurantId,
      },
    });
  }

  async update(id: string, data: any) {
    const updateData: any = {};
    if (data.number !== undefined) updateData.number = parseInt(data.number, 10);
    if (data.capacity !== undefined) updateData.capacity = parseInt(data.capacity, 10);
    if (data.status !== undefined) updateData.status = data.status;

    return this.prisma.table.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    return this.prisma.table.delete({
      where: { id },
    });
  }
}
