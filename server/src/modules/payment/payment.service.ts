import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';
import { PaymentWebhookBodyPayload } from './dtos/payment-webhook.dto';
import { PaymentRequestDto } from './dtos/payment-request.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly payOS: PayOS;

  constructor(private readonly configService: ConfigService) {
    const clientId = this.configService.get<string>('PAYOS_CLIENT_ID');
    const apiKey = this.configService.get<string>('PAYOS_API_KEY');
    const checksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY');

    if (!clientId || !apiKey || !checksumKey) {
      throw new Error('PayOS configuration is missing');
    }

    // Initialize PayOS with configuration object (required for v2.0.x)
    this.payOS = new PayOS({
      clientId,
      apiKey,
      checksumKey,
    });

    this.logger.log('PayOS initialized (v2.0.3)');
  }

  async createPaymentLink(payload: PaymentRequestDto) {
    const { orderId, amount, description } = payload;

    // Convert orderId string to number for PayOS (orderCode)
    // PayOS requires orderCode as a number
    const orderCode = Number(orderId.replace(/[^0-9]/g, '').slice(-10));
    const domain = this.configService.getOrThrow<string>('CLIENT_URL');

    try {
      const paymentLink = await this.payOS.paymentRequests.create({
        orderCode,
        amount,
        description: description.slice(0, 25),
        returnUrl: `${domain}/booking/payment/success?orderCode=${orderCode}`,
        cancelUrl: `${domain}/booking/payment/cancel?orderCode=${orderCode}`,
      });

      return paymentLink;
    } catch (error) {
      this.logger.error('Create PayOS payment link failed', error);
      throw new BadRequestException('Could not create payment link');
    }
  }

  async getPaymentStatus(orderCode: number | string) {
    try {
      return await this.payOS.paymentRequests.get(Number(orderCode));
    } catch (error) {
      this.logger.error(
        `Get payment status failed for order ${orderCode}`,
        error,
      );
      throw new BadRequestException('Could not get payment status');
    }
  }

  async cancelPaymentLink(orderCode: number | string, reason?: string) {
    try {
      return await this.payOS.paymentRequests.cancel(
        Number(orderCode),
        reason || 'Cancelled by user',
      );
    } catch (error) {
      this.logger.warn(`Cancel payment failed: ${orderCode}`, error);
      return null;
    }
  }

  verifyWebhookData(payload: PaymentWebhookBodyPayload) {
    try {
      return this.payOS.webhooks.verify(payload);
    } catch (error) {
      this.logger.error('Invalid PayOS webhook signature', error);
      throw new BadRequestException('Invalid webhook signature');
    }
  }
}
