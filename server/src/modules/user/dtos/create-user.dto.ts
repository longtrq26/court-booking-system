import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email format is invalid' })
  @Transform(({ value }: { value: string }) => value?.toLowerCase()?.trim())
  email: string;

  @ApiProperty({
    description:
      'Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)',
    example: 'StrongP@ss123!',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(50, { message: 'Password is too long' }) // Tránh DoS bằng pass quá dài
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'Password must contain uppercase, lowercase, number, and special character',
  })
  password: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'Nguyen Van A',
  })
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString({ message: 'Full name must be a string' })
  @Transform(({ value }: { value: string }) =>
    value?.trim()?.replace(/[<>]/g, ''),
  )
  fullName: string;

  @ApiProperty({
    description: 'Vietnamese phone number (10 digits)',
    example: '0912345678',
  })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g, {
    message: 'Invalid Vietnamese phone number',
  })
  @Transform(({ value }: { value: string }) => value?.replace(/[^\d]/g, ''))
  phoneNumber: string;
}
