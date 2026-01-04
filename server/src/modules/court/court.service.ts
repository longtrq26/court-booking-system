import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingStatus } from 'src/common/enums/booking/booking-status.enum';
import { WeekDay } from 'src/common/enums/court/week-day.enum';
import {
  Between,
  FindManyOptions,
  FindOptionsWhere,
  In,
  Like,
  Repository,
} from 'typeorm';
import { BookingItemEntity } from '../booking/entities/booking-item.entity';
import { CourtFilterDto } from './dtos/court-filter.dto';
import {
  CourtScheduleQueryDto,
  CourtScheduleResponseDto,
  DayScheduleDto,
  ScheduleViewType,
  TimeSlotDto,
} from './dtos/court-schedule.dto';
import { CreateCourtDto } from './dtos/create-court.dto';
import { UpdateCourtDto } from './dtos/update-court.dto';
import { CourtPriceEntity } from './entities/court-price.entity';
import { CourtEntity } from './entities/court.entity';

@Injectable()
export class CourtService {
  private readonly logger = new Logger(CourtService.name);

  constructor(
    @InjectRepository(CourtEntity)
    private readonly courtRepository: Repository<CourtEntity>,
    @InjectRepository(CourtPriceEntity)
    private readonly courtPriceRepository: Repository<CourtPriceEntity>,
    @InjectRepository(BookingItemEntity)
    private readonly bookingItemRepository: Repository<BookingItemEntity>,
  ) {}

  async createCourt(dto: CreateCourtDto): Promise<CourtEntity> {
    this.logger.log(`Creating new court: ${dto.name} at ${dto.location}`);

    // check if court already exists
    const existingCourt = await this.courtRepository.findOne({
      where: { name: dto.name, location: dto.location },
    });
    if (existingCourt) {
      this.logger.warn(`Court creation failed - already exists: ${dto.name}`);
      throw new BadRequestException('Court already exists');
    }

    // create court with prices (cascade)
    const newCourt = this.courtRepository.create({
      ...dto,
      prices: dto.prices.map((price) =>
        this.courtPriceRepository.create(price),
      ),
    });

    const savedCourt = await this.courtRepository.save(newCourt);
    this.logger.log(`Court created successfully: ${savedCourt.id}`);
    return savedCourt;
  }

  async findCourtById(id: string): Promise<CourtEntity> {
    const court = await this.courtRepository.findOne({
      where: { id },
      relations: ['prices'],
      // Sort price for calculate booking price
      order: {
        prices: {
          priority: 'DESC',
          // If same priority, sort by start time
          startTime: 'ASC',
        },
      },
    });
    if (!court) {
      throw new NotFoundException('Court not found');
    }
    return court;
  }

  async findAllCourts(filter: CourtFilterDto): Promise<{
    data: CourtEntity[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    this.logger.log(
      `Finding all courts with filter: ${JSON.stringify(filter)}`,
    );
    // pagination
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const offset = (page - 1) * limit;

    // filter
    const whereConditions: FindOptionsWhere<CourtEntity> = { isActive: true };
    if (filter.type) whereConditions.type = filter.type;

    const findOptions: FindManyOptions<CourtEntity> = {
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
      relations: ['prices'],
      where: whereConditions,
    };

    // search
    if (filter.search) {
      const keyword = `%${filter.search}%`;
      findOptions.where = [
        { ...whereConditions, name: Like(keyword) },
        { ...whereConditions, location: Like(keyword) },
      ];
    }

    // find and count
    const [data, total] = await this.courtRepository.findAndCount(findOptions);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateCourt(id: string, dto: UpdateCourtDto): Promise<CourtEntity> {
    this.logger.log(`Updating court: ${id}`);
    const court = await this.findCourtById(id);

    // Merge basic info
    this.courtRepository.merge(court, dto);

    // Handle prices update (Replace all strategy)
    // If prices are provided, delete old prices and create new ones
    if (dto.prices) {
      this.logger.log(`Updating prices for court: ${id}`);
      await this.courtPriceRepository.delete({ courtId: id });
      court.prices = dto.prices.map((price) =>
        this.courtPriceRepository.create({ ...price, courtId: id }),
      );
    }

    const updatedCourt = await this.courtRepository.save(court);
    this.logger.log(`Court updated successfully: ${id}`);
    return updatedCourt;
  }

  async deleteCourt(id: string): Promise<void> {
    this.logger.log(`Deleting court: ${id}`);
    const result = await this.courtRepository.softDelete(id);
    if (result.affected === 0) {
      this.logger.warn(`Delete failed - court not found: ${id}`);
      throw new NotFoundException(`Court #${id} not found`);
    }
    this.logger.log(`Court deleted successfully: ${id}`);
  }

  async calculateBookingPrice(
    courtId: string,
    bookingDate: Date,
    startTime: string,
    endTime: string,
  ): Promise<number> {
    const dayIndex = bookingDate.getDay();
    const currentWeekDay = this.mapJsDayToEnum(dayIndex);

    const court = await this.findCourtById(courtId);

    // Find matched price
    const matchedPrice = court.prices.find((p) => {
      // Check day
      if (!p.daysOfWeek.includes(currentWeekDay)) return false;

      // Check time slot
      return startTime >= p.startTime && endTime <= p.endTime;
    });

    if (!matchedPrice) {
      this.logger.warn(
        `Price calculation failed - no config found: Court ${courtId}, Date ${bookingDate.toISOString()}, Time ${startTime}-${endTime}`,
      );
      throw new BadRequestException(
        `No price configured for ${startTime}-${endTime} on ${currentWeekDay}`,
      );
    }

    // Calculate duration (hours)
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const duration = endH + endM / 60 - (startH + startM / 60);

    if (duration <= 0) throw new BadRequestException('Invalid time duration');

    // Convert string (from DB) to number if not transformed
    // (TypeORM transformer already did this, so here it's a number)
    return Number(matchedPrice.price) * duration;
  }

  async getCourtSchedule(
    courtId: string,
    query: CourtScheduleQueryDto,
  ): Promise<CourtScheduleResponseDto> {
    this.logger.log(
      `Getting schedule for court: ${courtId} (Range: ${query.startDate} to ${query.endDate || 'default'})`,
    );
    // Verify court
    const court = await this.findCourtById(courtId);

    // Calculate Date Range
    const startDate = new Date(query.startDate); // Set time to 00:00:00 UTC based on input
    let endDate: Date;

    if (query.endDate) {
      endDate = new Date(query.endDate);
    } else {
      endDate = new Date(startDate);
      const viewType = query.viewType || ScheduleViewType.WEEKLY;
      if (viewType === ScheduleViewType.DAILY) {
        // endDate = startDate
      } else if (viewType === ScheduleViewType.WEEKLY) {
        endDate.setDate(endDate.getDate() + 6);
      } else if (viewType === ScheduleViewType.MONTHLY) {
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(endDate.getDate() - 1);
      }
    }

    const slotDuration = query.slotDuration || 60; // Minutes

    // Format YYYY-MM-DD để query DB
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Get Existing Bookings
    const bookings = await this.bookingItemRepository.find({
      where: {
        courtId,
        refDate: Between(startDateStr, endDateStr),
        status: In([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
      },
      relations: ['booking', 'booking.user'], // Load parent booking and user
    });

    // Generate Schedule
    const schedule: DayScheduleDto[] = [];
    let totalSlots = 0;
    let totalBookedSlots = 0;

    const currentDate = new Date(startDate);

    // Loop each day
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = this.getDayOfWeekName(currentDate.getDay());

      // Generate slots for that day
      const slots = await this.generateTimeSlotsForDay(
        court,
        new Date(currentDate), // Clone date to avoid reference
        slotDuration,
        bookings.filter((b) => b.refDate === dateStr),
      );

      const availableCount = slots.filter((s) => s.isAvailable).length;

      totalSlots += slots.length;
      totalBookedSlots += slots.length - availableCount;

      schedule.push({
        date: dateStr,
        dayOfWeek,
        slots,
        availableSlots: availableCount,
        bookedSlots: slots.length - availableCount,
      });

      // Next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      courtId,
      courtName: court.name,
      startDate: startDateStr,
      endDate: endDateStr,
      schedule,
      totalAvailableSlots: totalSlots,
      totalBookedSlots,
      slotDuration,
    };
  }

  private async generateTimeSlotsForDay(
    court: CourtEntity,
    date: Date,
    slotDuration: number,
    bookings: BookingItemEntity[],
  ): Promise<TimeSlotDto[]> {
    const slots: TimeSlotDto[] = [];

    // Config open and close hour
    const openHour = 6; // 06:00
    const closeHour = 22; // 22:00

    // Loop by minute to avoid floating point error
    // start: 6 * 60 = 360
    // end: 22 * 60 = 1320
    let currentMinute = openHour * 60;
    const endMinute = closeHour * 60;

    while (currentMinute + slotDuration <= endMinute) {
      const startStr = this.minutesToTimeString(currentMinute);
      const endStr = this.minutesToTimeString(currentMinute + slotDuration);

      // Check Available: Slot is booked or not?
      // Logic overlap: (StartA < EndB) && (EndA > StartB)
      // Convert to Date object to compare accurately

      const slotStart = new Date(date);
      slotStart.setHours(
        Math.floor(currentMinute / 60),
        currentMinute % 60,
        0,
        0,
      );

      const slotEnd = new Date(date);
      slotEnd.setHours(
        Math.floor((currentMinute + slotDuration) / 60),
        (currentMinute + slotDuration) % 60,
        0,
        0,
      );

      const booking = bookings.find((b) => {
        // b.startTime is DB timestamp (Date object)
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);

        // Standard overlap logic:
        return bStart < slotEnd && bEnd > slotStart;
      });

      let price = 0;
      try {
        price = await this.calculateBookingPrice(
          court.id,
          date,
          startStr,
          endStr,
        );
      } catch {
        // If no price -> Consider as not available or price = 0
        price = 0;
      }

      slots.push({
        startTime: startStr,
        endTime: endStr,
        isAvailable: !booking, // True if no booking
        price,
        bookingId: booking?.bookingId, // Access qua relation
        bookedBy: booking?.booking?.user?.fullName ?? undefined, // Tên người đặt
        note: booking?.booking?.note ?? undefined,
      });

      // Next slot
      currentMinute += slotDuration;
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

  private getDayOfWeekName(dayIndex: number): string {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[dayIndex];
  }

  private minutesToTimeString(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
}
