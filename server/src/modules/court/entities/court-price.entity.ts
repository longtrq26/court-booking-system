import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { WeekDay } from '../../../common/enums/court/week-day.enum';
import { ColumnNumericTransformer } from '../../../common/utils';
import { CourtEntity } from './court.entity';

@Entity('court_prices')
@Index(['courtId'])
@Index(['courtId', 'priority'])
export class CourtPriceEntity extends BaseEntity {
  @Column({ name: 'court_id' })
  courtId: string;

  @ManyToOne(() => CourtEntity, (court) => court.prices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'court_id' })
  court: CourtEntity;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  price: number;

  @Column({ default: 0 })
  priority: number;

  @Column({
    type: 'enum',
    enum: WeekDay,
    array: true,
    name: 'days_of_week',
    default: [],
  })
  daysOfWeek: WeekDay[];

  @Column({ type: 'text', nullable: true })
  note: string | null;
}
