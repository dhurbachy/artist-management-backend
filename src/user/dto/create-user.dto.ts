import {
    IsString, IsEmail, IsEnum,
    IsOptional, IsDateString, MinLength, IsNotEmpty
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
export enum UserRole {
    SUPER_ADMIN = 'super_admin',
    ARTIST_MANAGER = 'artist_manager',
    ARTIST = 'artist',
}

export enum Gender {
    MALE = 'm',
    FEMALE = 'f',
    OTHER = 'o',
}

export class CreateUserDto {
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

    @ApiProperty({ example: 'john.doe@example.com' })
    @IsEmail()
    @Transform(({ value }) => value?.trim().toLowerCase())
    email: string;

    @ApiProperty({ example: 'Passw0rd123', minLength: 8 })
    @IsString()
    @IsNotEmpty()

    @MinLength(8)
    password: string;

    @ApiPropertyOptional({ example: '1234567890' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: '1995-06-15', description: 'ISO8601 Date string' })
    @IsOptional()
    @IsDateString()
    dob?: string;

    @ApiPropertyOptional({ enum: Gender, example: Gender.MALE })
    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @ApiPropertyOptional({ example: '123 Music Ave, Nashville, TN' })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())

    address?: string;

    @ApiPropertyOptional({
        enum: UserRole,
        default: UserRole.ARTIST,
        example: UserRole.ARTIST_MANAGER
    }) @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}