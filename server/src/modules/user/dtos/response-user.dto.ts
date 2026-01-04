import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/common/enums/user-role.enum';

export class UserResponseDto {
  @ApiProperty({ example: 'b3d1f7e4-8d4a-4a8f-9b4a-123456789abc' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  fullName: string;

  @ApiProperty({ example: '0912345678' })
  phoneNumber: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER })
  role: UserRole;
}
