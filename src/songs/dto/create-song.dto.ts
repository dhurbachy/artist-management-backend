import { IsString, IsOptional, IsEnum,IsNotEmpty  } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
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
   @IsNotEmpty() 
   @Transform(({value})=>value.trim())
  title: string;

  @ApiPropertyOptional({ example: 'Hey Jude Album' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({value})=>value.trim())
  album_name?: string;

  @ApiPropertyOptional({ enum: GenreType, example: GenreType.ROCK })
  @IsOptional()
  @IsEnum(GenreType)
  genre?: GenreType;
}
