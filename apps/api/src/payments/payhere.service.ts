import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayHereService {
  private merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || '';
  private merchantId = process.env.PAYHERE_MERCHANT_ID || '';

  constructor(private prisma: PrismaService) {}

  verifyWebhook(data: any): boolean {
    const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = data;
    const localMd5sig = crypto.createHash('md5').update(
      `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${crypto.createHash('md5').update(this.merchantSecret).digest('hex').toUpperCase()}`
    ).digest('hex').toUpperCase();

    return localMd5sig === md5sig;
  }

  async handlePaymentSuccess(orderId: string, paymentId: string, amount: number) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' }
    });
    
    await this.prisma.payment.upsert({
      where: { orderId: orderId },
      update: { status: 'SUCCESS', paymentId, amount },
      create: { orderId, status: 'SUCCESS', paymentId, amount, method: 'PAYHERE' }
    });

    console.log(`[Printer] Triggering KOT/Receipt print for Order ${orderId}`);
  }
}
