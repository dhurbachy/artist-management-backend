import {
  Controller, Post, Get, Body,
  UseGuards, HttpCode, HttpStatus,Res,
} from '@nestjs/common';
import type { Response } from 'express';

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
async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,  // ✅ passthrough keeps NestJS response handling
) {
    const result = await this.authService.login(dto);

    // ✅ Set refresh_token as httpOnly cookie
    res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: false,       // false for localhost, true in production
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ✅ Only return access_token — never expose refresh_token to JS
    return {
        message: result.message,
        user: result.user,
        access_token: result.access_token,
    };
}

@Post('logout')
@HttpCode(HttpStatus.OK)
@UseGuards(AuthGuard('jwt'))
async logout(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
) {
    await this.authService.logout(userId);

    // ✅ Clear the cookie
    res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
    });

    return { message: 'Logged out successfully' };
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