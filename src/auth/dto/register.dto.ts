// src/auth/dto/register.dto.ts
import {
  IsEmail, IsString, MinLength,
  IsOptional, IsEnum, IsDateString,
} from 'class-validator';

export enum UserRole {
  SUPER_ADMIN     = 'super_admin',
  ARTIST_MANAGER  = 'artist_manager',
  ARTIST          = 'artist',
}

export enum GenderType {
  MALE   = 'm',
  FEMALE = 'f',
  OTHER  = 'o',
}

export class RegisterDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsEnum(GenderType)
  gender?: GenderType;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}