import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PaymentStatus } from '../../../common/enums/payment/payment-status.enum';
import { ColumnNumericTransformer } from '../../../common/utils';
import { BookingEntity } from '../../booking/entities/booking.entity';

@Entity('payments')
export class PaymentEntity extends BaseEntity {
  @Column({ name: 'booking_id' })
  bookingId: string;

  @ManyToOne(() => BookingEntity)
  @JoinColumn({ name: 'booking_id' })
  booking: BookingEntity;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  amount: number;

  @Column({
    name: 'order_code',
    type: 'bigint',
    transformer: new ColumnNumericTransformer(),
  })
  orderCode: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ name: 'payment_url', type: 'text', nullable: true })
  paymentUrl: string;

  @Column({ name: 'qr_code', type: 'text', nullable: true })
  qrCode: string;

  @Column({ name: 'transaction_id', nullable: true })
  transactionId: string;
}
