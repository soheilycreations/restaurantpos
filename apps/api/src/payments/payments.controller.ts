import { Controller, Post, Body, UnauthorizedException, HttpCode } from '@nestjs/common';
import { PayHereService } from './payhere.service';

@Controller('payments')
export class PaymentsController {
  constructor(private payHereService: PayHereService) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: any) {
    const isValid = this.payHereService.verifyWebhook(body);
    if (!isValid) throw new UnauthorizedException('Invalid Signature');

    if (body.status_code === '2') {
       await this.payHereService.handlePaymentSuccess(body.order_id, body.payment_id, parseFloat(body.payhere_amount));
    }
    return { success: true };
  }
}
