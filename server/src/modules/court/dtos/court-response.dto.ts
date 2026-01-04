import { CourtType } from 'src/common/enums/court/court-type.enum';
import { WeekDay } from 'src/common/enums/court/week-day.enum';

export class CourtPriceResponseDto {
  id: string;
  courtId: string;
  startTime: string;
  endTime: string;
  price: number;
  priority: number;
  daysOfWeek: WeekDay[];
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CourtResponseDto {
  id: string;
  name: string;
  location: string;
  description?: string;
  type: CourtType;
  isActive: boolean;
  prices: CourtPriceResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class CourtListResponseDto {
  data: CourtResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
