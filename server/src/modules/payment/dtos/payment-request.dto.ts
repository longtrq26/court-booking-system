export interface PaymentRequestDto {
  orderId: string;
  description: string;
  amount: number;
}

export interface PaymentRequestItem {
  name: string;
  quantity: number;
  price: number;
}

export interface PaymentRequestPayload {
  orderCode: number;
  amount: number;
  description: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  items?: PaymentRequestItem[];
  cancelUrl: string;
  returnUrl: string;
  expiredAt?: number;
  signature: string;
}
