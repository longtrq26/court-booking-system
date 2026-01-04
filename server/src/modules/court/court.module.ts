import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingItemEntity } from '../booking/entities/booking-item.entity';
import { CourtController } from './court.controller';
import { CourtService } from './court.service';
import { CourtPriceEntity } from './entities/court-price.entity';
import { CourtEntity } from './entities/court.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourtEntity,
      CourtPriceEntity,
      BookingItemEntity,
    ]),
  ],
  controllers: [CourtController],
  providers: [CourtService],
  exports: [CourtService],
})
export class CourtModule {}
