import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { BookingType } from 'src/common/enums/booking/booking-type.enum';
import { WeekDay } from 'src/common/enums/court/week-day.enum';

export class CreateBookingDto {
  @ApiProperty({
    description: 'Court ID',
    example: 'court_123456',
  })
  @IsNotEmpty({ message: 'Court ID is required' })
  @IsString({ message: 'Court ID must be a string' })
  @Type(() => String)
  courtId: string;

  @ApiProperty({
    description: 'Booking type',
    example: BookingType.SINGLE,
    enum: BookingType,
  })
  @IsNotEmpty({ message: 'Booking type is required' })
  @IsEnum(BookingType, { message: 'Invalid booking type' })
  type: BookingType;

  @ApiPropertyOptional({
    description: 'Booking date (required for SINGLE)',
    example: '2026-01-10',
    format: 'date',
  })
  @ValidateIf((o: CreateBookingDto) => o.type === BookingType.SINGLE)
  @IsNotEmpty({ message: 'Date is required for SINGLE booking' })
  @IsDateString({}, { message: 'Date must be a valid ISO date string' })
  date?: string;

  @ApiPropertyOptional({
    description: 'Start date for fixed booking',
    example: '2026-01-01',
    format: 'date',
  })
  @ValidateIf((o: CreateBookingDto) => o.type === BookingType.FIXED)
  @IsNotEmpty({ message: 'Start date is required for FIXED booking' })
  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for fixed booking',
    example: '2026-03-31',
    format: 'date',
  })
  @ValidateIf((o: CreateBookingDto) => o.type === BookingType.FIXED)
  @IsNotEmpty({ message: 'End date is required for FIXED booking' })
  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Days of week for fixed booking',
    example: [WeekDay.MONDAY, WeekDay.WEDNESDAY],
    enum: WeekDay,
    isArray: true,
  })
  @ValidateIf((o: CreateBookingDto) => o.type === BookingType.FIXED)
  @IsNotEmpty({ message: 'Days of week are required for FIXED booking' })
  @IsArray({ message: 'Days of week must be an array' })
  @IsEnum(WeekDay, { each: true, message: 'Invalid day of week value' })
  @ArrayMinSize(1, { message: 'At least one day of week is required' })
  daysOfWeek?: WeekDay[];

  @ApiProperty({
    description: 'Start time in HH:mm format',
    example: '17:00',
  })
  @IsNotEmpty({ message: 'Start time is required' })
  @IsString({ message: 'Start time must be a string' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:mm format (e.g., 17:00)',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time in HH:mm format',
    example: '19:00',
  })
  @IsNotEmpty({ message: 'End time is required' })
  @IsString({ message: 'End time must be a string' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:mm format (e.g., 19:00)',
  })
  endTime: string;

  @ApiPropertyOptional({
    description: 'Additional note for booking',
    example: 'Khách cần sân gần cổng',
  })
  @IsOptional()
  @IsString({ message: 'Note must be a string' })
  @Type(() => String)
  note?: string;
}
