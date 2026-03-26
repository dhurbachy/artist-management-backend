import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginDto {
  @ApiProperty({ example: "test@example.com" })
  @Transform(({value})=>value.trim())
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ minLength: 8, example: "password123" })
  @Transform(({value})=>value.trim())
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}