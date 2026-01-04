import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { CourtType } from 'src/common/enums/court/court-type.enum';
import { WeekDay } from 'src/common/enums/court/week-day.enum';

export class CreateCourtPriceDto {
  @ApiProperty({
    description: 'Start time in HH:mm format',
    example: '08:00',
  })
  @IsNotEmpty({ message: 'Start time is required' })
  @IsString({ message: 'Start time must be a string' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:mm format (e.g., 08:00)',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time in HH:mm format',
    example: '17:00',
  })
  @IsNotEmpty({ message: 'End time is required' })
  @IsString({ message: 'End time must be a string' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:mm format (e.g., 17:00)',
  })
  endTime: string;

  @ApiProperty({
    description: 'Price per hour in VND',
    example: 100000,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Price is required' })
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be at least 0' })
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({
    description:
      'Priority for applying this price rule (higher = applied first)',
    example: 10,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Priority must be a number' })
  @Min(0, { message: 'Priority must be at least 0' })
  @Type(() => Number)
  priority?: number;

  @ApiProperty({
    description: 'Days of week this price applies to',
    example: [WeekDay.MONDAY, WeekDay.TUESDAY],
    enum: WeekDay,
    isArray: true,
  })
  @IsNotEmpty({ message: 'Days of week are required' })
  @IsArray({ message: 'Days of week must be an array' })
  @IsEnum(WeekDay, { each: true, message: 'Invalid day of week value' })
  @ArrayMinSize(1, { message: 'At least one day of week is required' })
  daysOfWeek: WeekDay[];
}

export class CreateCourtDto {
  @ApiProperty({
    description: 'Court name',
    example: 'Sân cầu lông VIP 01',
  })
  @IsNotEmpty({ message: 'Court name is required' })
  @IsString({ message: 'Court name must be a string' })
  @Type(() => String)
  name: string;

  @ApiProperty({
    description: 'Court location/address',
    example: '123 Nguyễn Văn Linh, Q7, TP.HCM',
  })
  @IsNotEmpty({ message: 'Location is required' })
  @IsString({ message: 'Location must be a string' })
  @Type(() => String)
  location: string;

  @ApiPropertyOptional({
    description: 'Court description',
    example: 'Sân chất lượng cao, có điều hòa',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Type(() => String)
  description?: string;

  @ApiProperty({
    description: 'Type of court',
    example: CourtType.FOOTBALL,
    enum: CourtType,
  })
  @IsNotEmpty()
  @IsEnum(CourtType)
  type: CourtType;

  @ApiProperty({
    description: 'Price rules',
    type: [CreateCourtPriceDto],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateCourtPriceDto)
  prices: CreateCourtPriceDto[];
}
