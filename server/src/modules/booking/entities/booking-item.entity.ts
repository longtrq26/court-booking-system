import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { BookingStatus } from '../../../common/enums/booking/booking-status.enum';
import { ColumnNumericTransformer } from '../../../common/utils';
import { CourtEntity } from '../../court/entities/court.entity';
import { BookingEntity } from './booking.entity';

@Entity('booking_items')
@Index(['courtId', 'startTime', 'endTime'])
@Index(['courtId', 'refDate'])
export class BookingItemEntity extends BaseEntity {
  @Column({ name: 'booking_id' })
  bookingId: string;

  @ManyToOne(() => BookingEntity, (booking) => booking.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: BookingEntity;

  @Column({ name: 'court_id' })
  courtId: string;

  @ManyToOne(() => CourtEntity)
  @JoinColumn({ name: 'court_id' })
  court: CourtEntity;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp' })
  endTime: Date;

  @Column({ name: 'ref_date', type: 'date' })
  refDate: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  price: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;
}
