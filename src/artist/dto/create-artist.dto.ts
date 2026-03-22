import {
    IsString, IsOptional, IsEnum,
    IsDateString, IsInt, Min, IsUUID,
} from 'class-validator';

export enum GenderType {
    MALE = 'm',
    FEMALE = 'f',
    OTHER = 'o',
}
export class CreateArtistDto {
    @IsOptional()
    @IsUUID()
    user_id?: string;

    @IsString()
    name: string;

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
  @IsInt()
  @Min(1900)
  first_release_year?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  no_of_albums_released?: number;
}
