import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: "test@example.com" })

  @IsEmail()
  email: string;
  
  @ApiProperty({ minLength: 8, example: "password123" })

  @IsString()
  @MinLength(8)
  password: string;
}