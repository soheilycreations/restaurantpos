import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { EventsModule } from './events/events.module';
import { InventoryModule } from './inventory/inventory.module';
import { ProductsModule } from './products/products.module';
import { TablesModule } from './tables/tables.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { RestaurantModule } from './restaurant/restaurant.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    OrdersModule,
    PaymentsModule,
    EventsModule,
    InventoryModule,
    ProductsModule,
    TablesModule,
    AnalyticsModule,
    RestaurantModule
  ],
})
export class AppModule {}
// Diagnostic Pulse: Ensuring RestaurantModule registration is recognized by the watcher.
