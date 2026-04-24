import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- SYSTEM WIPE INITIATED ---');

  try {
    // 1. Delete dependent order data
    console.log('Wiping Payments...');
    await prisma.payment.deleteMany({});

    console.log('Wiping OrderItems...');
    await prisma.orderItem.deleteMany({});

    console.log('Wiping Orders...');
    await prisma.order.deleteMany({});

    console.log('Wiping Inventory Logs...');
    await prisma.inventoryLog.deleteMany({});

    // 2. Reset Tables to AVAILABLE
    console.log('Resetting Table Statuses...');
    await prisma.table.updateMany({
      data: { status: 'AVAILABLE' }
    });

    console.log('--- SCRUB COMPLETE: SYSTEM READY ---');
  } catch (error) {
    console.error('--- SCRUB FAILURE ---', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
