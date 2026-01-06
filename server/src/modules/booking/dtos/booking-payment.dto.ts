import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaymentStatus } from 'src/common/enums/payment/payment-status.enum';

export class BookingPaymentDto {
  @ApiProperty({ example: 'booking-uuid' })
  @IsNotEmpty()
  @IsString()
  bookingId: string;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PAID })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @ApiPropertyOptional({ example: 'payos_trans_123' })
  @IsOptional()
  @IsString()
  transactionId?: string;
}
