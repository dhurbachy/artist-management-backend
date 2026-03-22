// src/auth/strategies/jwt-refresh.strategy.ts
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
      jwtFromRequest:    ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:       config.get<string>('JWT_REFRESH_SECRET')!, 
      ignoreExpiration:  false,
      passReqToCallback: true,                     
    };
    super(options);
  }

  async validate(req: Request, payload: JwtRefreshPayload) {
    const authHeader   = req.get('Authorization');
    const refreshToken = authHeader?.replace('Bearer', '').trim();
    if (!refreshToken) throw new UnauthorizedException('Refresh token missing');

    return { ...payload, refreshToken };
  }
}