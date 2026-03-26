import {
  IsEmail, IsString, MinLength,
  IsOptional, IsEnum, IsDateString, IsNotEmpty, Matches
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ARTIST_MANAGER = 'artist_manager',
  ARTIST = 'artist',
}

export enum GenderType {
  MALE = 'm',
  FEMALE = 'f',
  OTHER = 'o',
}

export class RegisterDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  first_name: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  last_name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @Transform(({ value }) => value.trim())

  email: string;

  @ApiProperty({ minLength: 8, example: 'password123' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: '+9779812345678' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, {
    message: 'Invalid phone number',
  })
  phone?: string;

  @ApiPropertyOptional({ example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({ enum: GenderType, example: GenderType.MALE })
  @IsOptional()
  @IsEnum(GenderType)
  gender?: GenderType;

  @ApiPropertyOptional({ example: 'Kathmandu, Nepal' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.ARTIST })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
