import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Excel Seeding...');

  // 1. Get/Create Restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { id: '16ae97cd-c992-4103-9e58-f7c0671cc29d' },
    update: { name: 'WebPOS Official Demo' },
    create: {
      id: '16ae97cd-c992-4103-9e58-f7c0671cc29d',
      name: 'WebPOS Official Demo',
      location: 'Colombo, Sri Lanka',
    },
  });

  console.log(`✅ Restaurant prepared: ${restaurant.name} (${restaurant.id})`);

  // 2. Load JSON data
  const jsonPath = path.join(__dirname, '../../../scratch/prices.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Could not find prices.json at ${jsonPath}`);
  }
  
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const items = JSON.parse(rawData);
  console.log(`📊 Found ${items.length} items in Excel.`);

  // 3. Helper to infer category
  const inferCategory = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('soup')) return 'Soups';
    if (n.includes('rice & curry')) return 'Rice & Curry';
    if (n.includes('biriyani') || n.includes('biryani')) return 'Biryani';
    if (n.includes('kottu')) return 'Kottu';
    if (n.includes('fried rice')) return 'Fried Rice';
    if (n.includes('nasi goreng') || n.includes('mongolian')) return 'Special Rice';
    if (n.includes('noodles') || n.includes('pasta')) return 'Noodles';
    if (n.includes('devilled') || n.includes('fried') || n.includes('stew')) return 'Main Dishes';
    if (n.includes('omelette') || n.includes('egg')) return 'Egg Dishes';
    if (n.includes('drink') || n.includes('bottle') || n.includes('water') || n.includes('sprite') || n.includes('7up') || n.includes('egb') || n.includes('coffee') || n.includes('tea') || n.includes('soda')) return 'Drinks';
    if (n.includes('dessert') || n.includes('pudin') || n.includes('ice cream')) return 'Desserts';
    if (n.includes('burger')) return 'Burgers';
    return 'Other';
  };

  // 4. Process items
  const categories: Record<string, string> = {};

  // Pre-load existing categories for this restaurant
  const existingCategories = await prisma.category.findMany({
    where: { restaurantId: restaurant.id }
  });
  existingCategories.forEach(cat => {
    categories[cat.name] = cat.id;
  });

  for (const item of items) {
    const catName = inferCategory(item['Product name'] || '');
    
    // Get/Create Category
    if (!categories[catName]) {
      const cat = await prisma.category.upsert({
        where: { 
          id: `cat-${catName.toLowerCase().replace(/\s+/g, '-')}-${restaurant.id.slice(0, 5)}` 
        },
        update: { name: catName },
        create: {
          id: `cat-${catName.toLowerCase().replace(/\s+/g, '-')}-${restaurant.id.slice(0, 5)}`,
          name: catName,
          restaurantId: restaurant.id,
        },
      });
      categories[catName] = cat.id;
    }

    // Create Product
    const price = parseFloat(item['Unit price']) || 0;
    
    await prisma.product.upsert({
      where: { id: `prod-${item['Code']}-${restaurant.id.slice(0, 5)}` },
      update: {
        name: item['Product name'],
        price: price,
        categoryId: categories[catName],
        restaurantId: restaurant.id,
      },
      create: {
        id: `prod-${item['Code']}-${restaurant.id.slice(0, 5)}`,
        name: item['Product name'],
        price: price,
        categoryId: categories[catName],
        restaurantId: restaurant.id,
        description: `Imported from Excel. Code: ${item['Code']}`,
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80', // Default image
      },
    });
  }

  console.log('✅ Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
