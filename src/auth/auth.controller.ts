import {
  Controller, Post, Get, Body,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { LoginDto } from './dto/login.dto';
import { CurrentUser } from '../shared/decorators/current-user.decorator';

@ApiTags('Auth')

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  refresh(@CurrentUser() user: any) {
    return this.authService.refreshTokens(
      user.sub,
      user.email,
      user.role,
      user.refreshToken,
    );
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('access-token')

  getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }
}