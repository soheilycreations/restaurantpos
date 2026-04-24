const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const restaurant = await prisma.restaurant.findFirst();
  if (restaurant) {
    console.log(`Found Restaurant: ${restaurant.name} (ID: ${restaurant.id})`);
    
    // Seed 6 tables if none exist
    const count = await prisma.table.count({ where: { restaurantId: restaurant.id } });
    if (count === 0) {
      console.log('Seeding 6 default tables...');
      const tablesData = Array.from({ length: 6 }, (_, i) => ({
        number: i + 1,
        capacity: i % 2 === 0 ? 4 : 2,
        restaurantId: restaurant.id,
        status: 'AVAILABLE'
      }));
      
      await prisma.table.createMany({ data: tablesData });
      console.log('Successfully seeded 6 tables!');
    } else {
      console.log(`Tables already exist (${count}). Skipping seeding.`);
    }
  } else {
    console.log('No restaurant found in DB.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
