import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const restaurantId = '16ae97cd-c992-4103-9e58-f7c0671cc29d';
  
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: {
      categories: true,
      products: {
        take: 5
      }
    }
  });

  if (!restaurant) {
    console.log('❌ Restaurant not found');
    return;
  }

  console.log(`✅ Restaurant: ${restaurant.name}`);
  console.log(`📂 Categories: ${restaurant.categories.length}`);
  restaurant.categories.forEach(c => console.log(`  - ${c.name} (${c.id})`));
  
  console.log(`🍕 Products: ${await prisma.product.count({ where: { restaurantId } })}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
