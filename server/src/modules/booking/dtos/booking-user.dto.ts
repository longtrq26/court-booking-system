import { ApiProperty } from '@nestjs/swagger';

export class BookingUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;
}
