import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CourtType } from '../../../common/enums/court/court-type.enum';
import { CourtPriceEntity } from './court-price.entity';

@Entity('courts')
@Index(['type', 'isActive', 'deletedAt'])
@Index(['location'])
export class CourtEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  location: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: CourtType, default: CourtType.FOOTBALL })
  type: CourtType;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => CourtPriceEntity, (price) => price.court, {
    cascade: true,
  })
  prices: CourtPriceEntity[];
}
