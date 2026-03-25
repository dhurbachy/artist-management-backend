import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

export interface JwtRefreshPayload {
  sub:          string;
  email:        string;
  role:         string;
  refreshToken: string;
  [key: string]: any;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    const options: StrategyOptionsWithRequest = {
      // ✅ Read from cookie instead of Authorization header
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const token = req?.cookies?.['refresh_token'];
          if (!token) return null;
          return token;
        },
      ]),
      secretOrKey:       config.get<string>('JWT_REFRESH_SECRET')!,
      ignoreExpiration:  false,
      passReqToCallback: true,
    };
    super(options);
  }

  async validate(req: Request, payload: JwtRefreshPayload) {
    // ✅ Read from cookie instead of Authorization header
    const refreshToken = req?.cookies?.['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');

    return { ...payload, refreshToken };
  }
}