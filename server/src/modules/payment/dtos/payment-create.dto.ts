export interface PaymentCreateData {
  bin: string;
  accountNumber: string;
  accountName: string;
  currency: string;
  paymentLinkId: string;
  amount: number;
  description: string;
  orderCode: number;
  expiredAt: number;
  status: string;
  checkoutUrl: string;
  qrCode: string;
}

export interface PaymentCreateResponse {
  code: string;
  desc: string;
  data: PaymentCreateData;
  signature: string;
}
