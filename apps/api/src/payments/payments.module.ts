import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PayHereService } from './payhere.service';

@Module({
  controllers: [PaymentsController],
  providers: [PayHereService],
})
export class PaymentsModule {}
