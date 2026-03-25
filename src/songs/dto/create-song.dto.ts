import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum GenreType {
  RNB     = 'rnb',
  COUNTRY = 'country',
  CLASSIC = 'classic',
  ROCK    = 'rock',
  JAZZ    = 'jazz',
}

export class CreateSongDto {
  @ApiProperty({ example: 'Hey Jude' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Hey Jude Album' })
  @IsOptional()
  @IsString()
  album_name?: string;

  @ApiPropertyOptional({ enum: GenreType, example: GenreType.ROCK })
  @IsOptional()
  @IsEnum(GenreType)
  genre?: GenreType;
}
