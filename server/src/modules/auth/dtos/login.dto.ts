import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email format is invalid' })
  @Transform(({ value }: { value: string }) => value?.toLowerCase()?.trim())
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'StrongP@ss123!',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  password: string;
}
