import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingItemEntity } from './entities/booking-item.entity';
import { BookingEntity } from './entities/booking.entity';
import { CourtModule } from '../court/court.module';
import { PaymentModule } from '../payment/payment.module';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookingEntity, BookingItemEntity]),
    CourtModule,
    PaymentModule,
    NotificationModule,
    UserModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
