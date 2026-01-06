import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, MoreThan, Not, Repository } from 'typeorm';
import { BookingStatus } from '../../common/enums/booking/booking-status.enum';
import { BookingType } from '../../common/enums/booking/booking-type.enum';
import { WeekDay } from '../../common/enums/court/week-day.enum';
import { NotificationType } from '../../common/enums/notification/notification-type.enum';
import { PaymentStatus } from '../../common/enums/payment/payment-status.enum';
import { CourtService } from '../court/court.service';
import { NotificationService } from '../notification/notification.service';
import { PaymentEntity } from '../payment/entities/payment.entity';
import { PaymentService } from '../payment/payment.service';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/entities/user.entity';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { BookingItemEntity } from './entities/booking-item.entity';
import { BookingEntity } from './entities/booking.entity';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingRepo: Repository<BookingEntity>,

    @InjectRepository(BookingItemEntity)
    private readonly bookingItemRepo: Repository<BookingItemEntity>,

    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,

    private readonly courtService: CourtService,
    private readonly notificationService: NotificationService,
    private readonly paymentService: PaymentService,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {}

  async createBooking(user: UserEntity, dto: CreateBookingDto) {
    const court = await this.courtService.findCourtById(dto.courtId);

    const slots = this.generateSlots(dto);
    if (slots.length === 0) {
      throw new BadRequestException('No valid slots generated from input');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;
      const bookingItems: BookingItemEntity[] = [];

      for (const slot of slots) {
        const conflict = await queryRunner.manager.findOne(BookingItemEntity, {
          where: {
            courtId: dto.courtId,
            status: Not(BookingStatus.CANCELLED),
            startTime: LessThan(slot.end),
            endTime: MoreThan(slot.start),
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (conflict) {
          throw new ConflictException(
            `Court is busy at ${slot.start.toLocaleString()}`,
          );
        }

        const price = await this.courtService.calculateBookingPrice(
          dto.courtId,
          slot.start,
          dto.startTime,
          dto.endTime,
        );

        totalAmount += price;

        const item = this.bookingItemRepo.create({
          courtId: dto.courtId,
          startTime: slot.start,
          endTime: slot.end,
          refDate: slot.refDate,
          price: price,
          status: BookingStatus.PENDING,
        });
        bookingItems.push(item);
      }

      const booking = this.bookingRepo.create({
        userId: user.id,
        totalPrice: totalAmount,
        bookingType: dto.type,
        note: dto.note,
        status: BookingStatus.PENDING,
        items: bookingItems,
      });

      const savedBooking = await queryRunner.manager.save(
        BookingEntity,
        booking,
      );
      await queryRunner.commitTransaction();

      let paymentInfo: {
        paymentUrl: string;
        qrCode: string;
        orderCode: number;
      } | null = null;
      try {
        const paymentLink = await this.paymentService.createPaymentLink({
          orderId: savedBooking.id,
          amount: totalAmount,
          description: `Payment for ${court.name} - ${user.fullName}`,
        });

        const payment = this.paymentRepo.create({
          bookingId: savedBooking.id,
          amount: totalAmount,
          orderCode: paymentLink.orderCode,
          status: PaymentStatus.PENDING,
          paymentUrl: paymentLink.checkoutUrl,
          qrCode: paymentLink.qrCode,
        });

        await this.paymentRepo.save(payment);

        paymentInfo = {
          paymentUrl: paymentLink.checkoutUrl,
          qrCode: paymentLink.qrCode,
          orderCode: paymentLink.orderCode,
        };

        this.logger.log(
          `PayOS payment link created for booking ${savedBooking.id}`,
        );
      } catch (error) {
        this.logger.error('Failed to create PayOS payment link:', error);
      }

      try {
        this.notificationService.notifyAdmins(
          'New Booking Created',
          `Customer ${user.fullName} has created a new ${
            dto.type === BookingType.SINGLE ? 'single' : 'fixed'
          } booking for ${court.name}. Total: ${totalAmount.toLocaleString()} VND`,
          NotificationType.BOOKING_CREATED,
          savedBooking.id,
          court.id,
        );
      } catch (error) {
        this.logger.error('Failed to send booking notification:', error);
      }

      return { ...savedBooking, paymentInfo };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private generateSlots(dto: CreateBookingDto) {
    const slots: { start: Date; end: Date; refDate: string }[] = [];
    const [startH, startM] = dto.startTime.split(':').map(Number);
    const [endH, endM] = dto.endTime.split(':').map(Number);

    if (dto.type === BookingType.SINGLE) {
      if (!dto.date) {
        throw new BadRequestException('Date is required for single booking');
      }
      const baseDate = new Date(dto.date);
      const start = new Date(baseDate);
      start.setHours(startH, startM, 0, 0);
      const end = new Date(baseDate);
      end.setHours(endH, endM, 0, 0);
      slots.push({ start, end, refDate: dto.date });
    } else if (dto.type === BookingType.FIXED) {
      if (!dto.startDate || !dto.endDate || !dto.daysOfWeek) {
        throw new BadRequestException(
          'Start date, end date, and days of week are required for fixed booking',
        );
      }
      const currentDate = new Date(dto.startDate);
      const endDate = new Date(dto.endDate);

      while (currentDate <= endDate) {
        const dayIndex = currentDate.getDay();
        const currentWeekDay = this.mapJsDayToEnum(dayIndex);

        if (dto.daysOfWeek.includes(currentWeekDay)) {
          const refDateStr = currentDate.toISOString().split('T')[0];
          const start = new Date(currentDate);
          start.setHours(startH, startM, 0, 0);
          const end = new Date(currentDate);
          end.setHours(endH, endM, 0, 0);
          slots.push({ start, end, refDate: refDateStr });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    return slots;
  }

  private mapJsDayToEnum(jsDay: number): WeekDay {
    const map = [
      WeekDay.SUNDAY,
      WeekDay.MONDAY,
      WeekDay.TUESDAY,
      WeekDay.WEDNESDAY,
      WeekDay.THURSDAY,
      WeekDay.FRIDAY,
      WeekDay.SATURDAY,
    ];
    return map[jsDay];
  }

  async getMyBookings(userId: string) {
    return this.bookingRepo.find({
      where: { userId },
      relations: ['items', 'items.court'],
      order: { createdAt: 'DESC' } as any,
    });
  }

  async getBookingById(id: string, userId: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id, userId } as any,
      relations: ['items', 'items.court'],
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async cancelBooking(id: string, userId: string, reason?: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id, userId } as any,
      relations: ['items'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }
    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed booking');
    }

    booking.status = BookingStatus.CANCELLED;
    booking.note = reason
      ? `${booking.note || ''} | Cancelled: ${reason}`
      : booking.note;
    booking.items.forEach((item) => {
      item.status = BookingStatus.CANCELLED;
    });

    return await this.bookingRepo.save(booking);
  }

  async getBookingsByCourt(
    courtId: string,
    date?: string,
    status?: BookingStatus,
  ) {
    const whereConditions: any = {};
    if (status) {
      whereConditions.status = status;
    }
    if (date) {
      whereConditions.items = { courtId, refDate: date };
    } else {
      whereConditions.items = { courtId };
    }
    return await this.bookingRepo.find({
      where: whereConditions,
      relations: ['items', 'user'],
      order: { createdAt: 'DESC' } as any,
    });
  }

  async updateBookingStatus(id: string, status: BookingStatus) {
    const booking = await this.bookingRepo.findOne({
      where: { id } as any,
      relations: ['items'],
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    booking.status = status;
    booking.items.forEach((item) => {
      item.status = status;
    });
    return await this.bookingRepo.save(booking);
  }

  async updatePaymentStatus(
    bookingId: string,
    paymentStatus: PaymentStatus,
    user?: UserEntity,
  ) {
    const whereCondition: any = { id: bookingId };
    if (user && user.role === 'CUSTOMER') {
      whereCondition.userId = user.id;
    }

    const booking = await this.bookingRepo.findOne({
      where: whereCondition,
      relations: ['items'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    booking.paymentStatus = paymentStatus;
    if (paymentStatus === PaymentStatus.PAID) {
      booking.status = BookingStatus.CONFIRMED;
      booking.items.forEach((item) => {
        item.status = BookingStatus.CONFIRMED;
      });
    }

    return await this.bookingRepo.save(booking);
  }
}
