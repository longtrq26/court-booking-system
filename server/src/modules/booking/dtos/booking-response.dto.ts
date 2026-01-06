import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from 'src/common/enums/booking/booking-status.enum'; // Check path
import { BookingType } from 'src/common/enums/booking/booking-type.enum';
import { PaymentStatus } from 'src/common/enums/payment/payment-status.enum';
import { BookingUserDto } from './booking-user.dto';

export class BookingItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  courtId: string;

  @ApiProperty()
  courtName: string;

  @ApiProperty()
  startTime: Date;

  @ApiProperty()
  endTime: Date;

  @ApiProperty()
  refDate: string;

  @ApiProperty()
  price: number;

  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;
}

export class BookingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ type: BookingUserDto })
  user?: BookingUserDto;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty({ enum: BookingStatus })
  status: BookingStatus;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty({ enum: BookingType })
  bookingType: BookingType;

  @ApiPropertyOptional()
  note?: string;

  @ApiPropertyOptional()
  cancellationReason?: string;

  @ApiProperty({ type: [BookingItemResponseDto] })
  items: BookingItemResponseDto[];

  @ApiPropertyOptional()
  paymentQrCode?: string;

  @ApiPropertyOptional()
  paymentUrl?: string;

  @ApiPropertyOptional()
  orderCode?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class BookingListResponseDto {
  @ApiProperty({ type: [BookingResponseDto] })
  data: BookingResponseDto[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
