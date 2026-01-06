import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { BookingStatus } from '../../common/enums/booking/booking-status.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserService } from '../user/user.service';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';

@ApiTags('booking')
@Controller('booking')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new court booking' })
  async createBooking(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateBookingDto,
  ) {
    const user = await this.userService.findUserById(userId);
    return this.bookingService.createBooking(user, dto);
  }

  @Get('my')
  @ApiOperation({ summary: "Get current user's bookings" })
  async getMyBookings(@CurrentUser('sub') userId: string) {
    return this.bookingService.getMyBookings(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details by ID' })
  async getBookingById(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.bookingService.getBookingById(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a booking' })
  async cancelBooking(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body('reason') reason?: string,
  ) {
    return this.bookingService.cancelBooking(id, userId, reason);
  }

  @Get('court/:courtId')
  @ApiOperation({ summary: 'Get bookings for a specific court' })
  async getBookingsByCourt(
    @Param('courtId') courtId: string,
    @Query('date') date?: string,
    @Query('status') status?: BookingStatus,
  ) {
    return this.bookingService.getBookingsByCourt(courtId, date, status);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update booking status (Admin only)' })
  async updateBookingStatus(
    @Param('id') id: string,
    @Body('status') status: BookingStatus,
  ) {
    // Note: Actually should have a RolesGuard check here
    return this.bookingService.updateBookingStatus(id, status);
  }
}
