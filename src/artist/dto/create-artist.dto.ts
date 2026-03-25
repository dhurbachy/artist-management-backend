import {
  IsString, IsOptional, IsEnum,
  IsDateString, IsInt, Min, IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum GenderType {
  MALE = 'm',
  FEMALE = 'f',
  OTHER = 'o',
}

export class CreateArtistDto {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiProperty({ example: 'The Beatles' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '1960-01-01' })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiPropertyOptional({ enum: GenderType, example: GenderType.MALE })
  @IsOptional()
  @IsEnum(GenderType)
  gender?: GenderType;

  @ApiPropertyOptional({ example: 'Liverpool, UK' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 1962, minimum: 1900 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  first_release_year?: number;

  @ApiPropertyOptional({ example: 12, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  no_of_albums_released?: number;
}
