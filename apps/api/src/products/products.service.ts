import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(restaurantId: string) {
    return this.prisma.product.findMany({
      where: { restaurantId },
      include: {
        category: true
      },
      orderBy: { name: 'asc' }
    });
  }

  async findCategories(restaurantId: string) {
    return this.prisma.category.findMany({
      where: { restaurantId },
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });
  }

  async createProduct(restaurantId: string, data: any) {
    return this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        image: data.image,
        categoryId: data.categoryId,
        restaurantId
      }
    });
  }

  async updateProduct(id: string, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = parseFloat(data.price);
    if (data.image !== undefined) updateData.image = data.image;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

    return this.prisma.product.update({
      where: { id },
      data: updateData
    });
  }

  async deleteProduct(id: string) {
    return this.prisma.product.delete({
      where: { id }
    });
  }

  async deleteProducts(ids: string[], restaurantId: string) {
    return this.prisma.product.deleteMany({
      where: {
        id: { in: ids },
        restaurantId
      }
    });
  }

  async createCategory(restaurantId: string, data: any) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        restaurantId
      }
    });
  }

  async updateCategory(id: string, data: any) {
    return this.prisma.category.update({
      where: { id },
      data: { name: data.name }
    });
  }

  async deleteCategory(id: string) {
    return this.prisma.category.delete({
      where: { id }
    });
  }
}
