import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserResponseDto } from './dtos/response-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserService } from './user.service';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOkResponse({
    description: 'Get current authenticated user profile',
    type: UserResponseDto,
  })
  async getProfile(
    @CurrentUser('sub') userId: string,
  ): Promise<UserResponseDto> {
    return this.userService.findUserById(userId);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({
    description: 'Profile updated successfully',
    type: UserResponseDto,
  })
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() updateProfileDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.updateUser(userId, updateProfileDto);
  }
}
