import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { PaymentWebhookBodyPayload } from './dtos/payment-webhook.dto';
import { PaymentService } from './payment.service';
import { PaymentRequestDto } from './dtos/payment-request.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Public()
  @Post('create')
  async createPaymentLink(@Body() body: PaymentRequestDto) {
    return this.paymentService.createPaymentLink(body);
  }

  @Public()
  @Get('status/:orderCode')
  async getPaymentStatus(@Param('orderCode') orderCode: string) {
    return this.paymentService.getPaymentStatus(orderCode);
  }

  @Public()
  @Delete('cancel/:orderCode')
  async cancelPaymentLink(@Param('orderCode') orderCode: string) {
    return this.paymentService.cancelPaymentLink(orderCode);
  }

  @Public()
  @Post('webhook')
  async handleWebhook(@Body() payload: PaymentWebhookBodyPayload) {
    return this.paymentService.verifyWebhookData(payload);
  }
}
