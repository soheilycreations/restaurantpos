import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Excel Seeding...');

  // 1. Get/Create Restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { id: 'web-pos-restaurant-id' }, // Stable ID for demo
    update: { name: 'webResturent POS' },
    create: {
      id: 'web-pos-restaurant-id',
      name: 'webResturent POS',
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
    if (n.includes('kottu')) return 'Kottu';
    if (n.includes('rice') || n.includes('biriyani')) return 'Rice Items';
    if (n.includes('noodles') || n.includes('pasta')) return 'Noodles';
    if (n.includes('drink') || n.includes('bottle') || n.includes('water') || n.includes('sprite') || n.includes('7up') || n.includes('egb')) return 'Drinks';
    if (n.includes('dessert') || n.includes('pudin') || n.includes('ice cream')) return 'Desserts';
    if (n.includes('burger')) return 'Burgers';
    return 'Other';
  };

  // 4. Process items
  const categories: Record<string, string> = {};

  for (const item of items) {
    const catName = inferCategory(item['Product name'] || '');
    
    // Get/Create Category
    if (!categories[catName]) {
      const cat = await prisma.category.upsert({
        where: { id: `cat-${catName.toLowerCase().replace(/\s+/g, '-')}` },
        update: {},
        create: {
          id: `cat-${catName.toLowerCase().replace(/\s+/g, '-')}`,
          name: catName,
          restaurantId: restaurant.id,
        },
      });
      categories[catName] = cat.id;
    }

    // Create Product
    await prisma.product.upsert({
      where: { id: `prod-${item['Code']}` },
      update: {
        name: item['Product name'],
        price: parseFloat(item['Unit price']) || 0,
        categoryId: categories[catName],
      },
      create: {
        id: `prod-${item['Code']}`,
        name: item['Product name'],
        price: parseFloat(item['Unit price']) || 0,
        categoryId: categories[catName],
        restaurantId: restaurant.id,
        description: `Imported from Excel. Code: ${item['Code']}`,
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
