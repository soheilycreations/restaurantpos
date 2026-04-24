import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(private readonly prisma: PrismaService) {}

  async deductInventoryForOrder(orderId: string, restaurantId: string, userId: string = 'system') {
    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId },
      include: {
        product: {
          include: {
            recipes: {
              include: { ingredient: true }
            }
          }
        }
      }
    });

    for (const item of orderItems) {
      for (const recipe of item.product.recipes) {
        const totalDeduction = recipe.quantity * item.quantity;
        
        const updatedIngredient = await this.prisma.ingredient.update({
          where: { id: recipe.ingredientId },
          data: {
            stockLevel: {
              decrement: totalDeduction
            }
          }
        });

        await this.prisma.inventoryLog.create({
          data: {
            type: 'DEDUCTION',
            quantity: totalDeduction,
            reason: `Order Sale [${orderId}]`,
            ingredientId: recipe.ingredientId,
            performedById: userId, 
            restaurantId: restaurantId
          }
        });

        if (updatedIngredient.stockLevel <= updatedIngredient.threshold) {
          this.logger.warn(`LOW STOCK ALERT: Ingredient ${updatedIngredient.name} is below threshold.`);
        }
      }
    }
  }
}
