import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database with Premium Content...');

  // 1. Create Restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { id: '16ae97cd-c992-4103-9e58-f7c0671cc29d' },
    update: {},
    create: {
      id: '16ae97cd-c992-4103-9e58-f7c0671cc29d',
      name: 'WebPOS Official Demo',
      location: 'Colombo 07',
    }
  });

  // 2. Create Categories
  const categoriesData = [
    { name: 'Burgers' },
    { name: 'Kottu' },
    { name: 'Rice Items' },
    { name: 'Drinks' },
    { name: 'Desserts' }
  ];

  const categoriesMap: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: { ...cat, restaurantId: restaurant.id }
    });
    categoriesMap[cat.name] = created;
  }

  // 3. Products
  const productsData = [
    { name: 'Signature Beef Burger', price: 15.00, category: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Spicy Zinger Burger', price: 12.50, category: 'Burgers', image: 'https://images.unsplash.com/photo-1513185158878-8d8ae148c767?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Classic Cheese Kottu', price: 8.50, category: 'Kottu', image: 'https://images.unsplash.com/photo-1606491956689-2ea8c5369512?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Seafood Kottu', price: 10.50, category: 'Kottu', image: 'https://images.unsplash.com/photo-1567306226416-28f0978d1ad3?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Mixed Fried Rice', price: 11.00, category: 'Rice Items', image: 'https://images.unsplash.com/photo-1512058560550-42749359a767?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Nasi Goreng', price: 13.00, category: 'Rice Items', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Fresh Lime Soda', price: 3.50, category: 'Drinks', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Iced Coffee', price: 4.50, category: 'Drinks', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Chocolate Pudding', price: 5.50, category: 'Desserts', image: 'https://images.unsplash.com/photo-1511910849309-0dffb8c85146?q=80&w=1000&auto=format&fit=crop' },
  ];

  for (const prod of productsData) {
    await prisma.product.create({
      data: {
        name: prod.name,
        price: prod.price,
        image: prod.image,
        categoryId: categoriesMap[prod.category].id,
        restaurantId: restaurant.id,
      }
    });
  }

  // 4. Tables
  for (let i = 1; i <= 10; i++) {
    await prisma.table.create({
      data: { number: i, capacity: i % 2 === 0 ? 4 : 2, restaurantId: restaurant.id }
    });
  }

  console.log('-------------------------------------------');
  console.log('Premium Seeding Complete!');
  console.log('Restaurant ID:', restaurant.id);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
