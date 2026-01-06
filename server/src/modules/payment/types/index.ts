import { PaymentStatus } from 'src/common/enums/payment/payment-status.enum';

export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  provider: string;
  status: PaymentStatus;
  metadata: Record<string, unknown>;
  paymentUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
