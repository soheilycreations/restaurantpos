import { PrismaClient } from '@rms/database';

const prisma = new PrismaClient();

async function main() {
  console.log('--- PURGING TRANSACTION DATA ---');
  
  try {
    // 1. Clear OrderItems
    const deletedItems = await prisma.orderItem.deleteMany({});
    console.log(`Deleted ${deletedItems.count} Order Items.`);

    // 2. Clear Payments
    const deletedPayments = await prisma.payment.deleteMany({});
    console.log(`Deleted ${deletedPayments.count} Payments.`);

    // 3. Clear Orders
    const deletedOrders = await prisma.order.deleteMany({});
    console.log(`Deleted ${deletedOrders.count} Orders.`);

    // 4. Reset Tables to AVAILABLE
    const updatedTables = await prisma.table.updateMany({
      data: { status: 'AVAILABLE' }
    });
    console.log(`Reset ${updatedTables.count} Tables to AVAILABLE.`);

    console.log('--- PURGE COMPLETE ---');
  } catch (err) {
    console.error('Purge Failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
