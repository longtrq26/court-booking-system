import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user/user-role.enum';
import { CourtService } from './court.service';
import { CourtFilterDto } from './dtos/court-filter.dto';
import {
  CourtListResponseDto,
  CourtResponseDto,
} from './dtos/court-response.dto';
import {
  CourtScheduleQueryDto,
  CourtScheduleResponseDto,
} from './dtos/court-schedule.dto';
import { CreateCourtDto } from './dtos/create-court.dto';
import { UpdateCourtDto } from './dtos/update-court.dto';

@ApiTags('Courts')
@Controller('courts')
export class CourtController {
  constructor(private readonly courtService: CourtService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new court (Admin/Owner)' })
  @ApiOkResponse({
    description: 'Court created successfully',
    type: CourtResponseDto,
  })
  async createCourt(@Body() dto: CreateCourtDto) {
    return await this.courtService.createCourt(dto);
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all courts with pagination' })
  @ApiOkResponse({
    description: 'List of courts',
    type: CourtListResponseDto,
  })
  async findAllCourts(@Query() filter: CourtFilterDto) {
    return await this.courtService.findAllCourts(filter);
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get court details by ID' })
  @ApiOkResponse({
    description: 'Court details',
    type: CourtResponseDto,
  })
  async findCourtById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.courtService.findCourtById(id);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update court details' })
  @ApiOkResponse({
    description: 'Court updated successfully',
    type: CourtResponseDto,
  })
  async updateCourt(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCourtDto,
  ) {
    return await this.courtService.updateCourt(id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a court' })
  @ApiOkResponse({ description: 'Court deleted successfully' })
  async deleteCourt(@Param('id', ParseUUIDPipe) id: string) {
    await this.courtService.deleteCourt(id);
    return { message: 'Court deleted successfully' };
  }

  @Public()
  @Get(':id/schedule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get court schedule & availability' })
  @ApiOkResponse({
    description: 'Court schedule',
    type: CourtScheduleResponseDto,
  })
  async getCourtSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: CourtScheduleQueryDto,
  ) {
    return await this.courtService.getCourtSchedule(id, query);
  }
}
