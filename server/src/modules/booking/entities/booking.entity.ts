import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { BookingStatus } from '../../../common/enums/booking/booking-status.enum';
import { BookingType } from '../../../common/enums/booking/booking-type.enum';
import { PaymentStatus } from '../../../common/enums/payment/payment-status.enum';
import { ColumnNumericTransformer } from '../../../common/utils';
import { UserEntity } from '../../user/entities/user.entity';
import { BookingItemEntity } from './booking-item.entity';

@Entity('bookings')
@Index(['userId'])
export class BookingEntity extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({
    name: 'booking_type',
    type: 'enum',
    enum: BookingType,
    default: BookingType.SINGLE,
  })
  bookingType: BookingType;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @OneToMany(() => BookingItemEntity, (item) => item.booking, {
    cascade: true,
  })
  items: BookingItemEntity[];
}
