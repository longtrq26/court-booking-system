import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export enum ScheduleViewType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export class CourtScheduleQueryDto {
  @ApiProperty({
    description: 'Start date for schedule (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @IsNotEmpty({ message: 'Start date is required' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({
    description:
      'End date for schedule (YYYY-MM-DD). If not provided, will use start date + view type duration',
    example: '2024-01-21',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'View type for schedule',
    enum: ScheduleViewType,
    default: ScheduleViewType.WEEKLY,
    example: ScheduleViewType.WEEKLY,
  })
  @IsOptional()
  @IsEnum(ScheduleViewType, { message: 'Invalid view type' })
  viewType?: ScheduleViewType;

  @ApiPropertyOptional({
    description: 'Slot duration in minutes (default: 60)',
    example: 60,
    default: 60,
    minimum: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Slot duration must be a number' })
  @Min(30, { message: 'Slot duration must be at least 30 minutes' })
  slotDuration?: number;
}

export class TimeSlotDto {
  @ApiProperty({ example: '08:00' })
  startTime: string;

  @ApiProperty({ example: '09:00' })
  endTime: string;

  @ApiProperty({ example: true })
  isAvailable: boolean;

  @ApiProperty({ example: 100000 })
  price: number;

  @ApiPropertyOptional({ example: 'booking-uuid-here' })
  bookingId?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  bookedBy?: string;

  @ApiPropertyOptional({ example: 'Court maintenance' })
  note?: string;
}

export class DayScheduleDto {
  @ApiProperty({ example: '2024-01-15' })
  date: string;

  @ApiProperty({ example: 'Monday' })
  dayOfWeek: string;

  @ApiProperty({ type: [TimeSlotDto] })
  slots: TimeSlotDto[];

  @ApiProperty({ example: 10 })
  availableSlots: number;

  @ApiProperty({ example: 4 })
  bookedSlots: number;
}

export class CourtScheduleResponseDto {
  @ApiProperty({ example: 'uuid-here' })
  courtId: string;

  @ApiProperty({ example: 'Sân cầu lông VIP 01' })
  courtName: string;

  @ApiProperty({ example: '2024-01-15' })
  startDate: string;

  @ApiProperty({ example: '2024-01-21' })
  endDate: string;

  @ApiProperty({ type: [DayScheduleDto] })
  schedule: DayScheduleDto[];

  @ApiProperty({ example: 70 })
  totalAvailableSlots: number;

  @ApiProperty({ example: 28 })
  totalBookedSlots: number;

  @ApiProperty({ example: 60 })
  slotDuration: number;
}
