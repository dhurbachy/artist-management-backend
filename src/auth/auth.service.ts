import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepo:    AuthRepository,
    private readonly jwtService:  JwtService,
    private readonly config:      ConfigService,
  ) {}

  async register(dto: RegisterDto) {
  const exists = await this.authRepo.findByEmail(dto.email);
  if (exists) throw new ConflictException('Email already registered');

  const hashed = await bcrypt.hash(dto.password, 12);

  const { password, ...rest } = dto;   

  const user = await this.authRepo.createUser({
    ...rest,
    password: hashed,
    dob: dto.dob ? new Date(dto.dob) : null, 
  });

  return {
    message: 'Registration successful. Please login.',
    user,
  };
}

  async login(dto: LoginDto) {
    // 1. find user
    const user = await this.authRepo.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // 2. verify password
    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    // 3. generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // 4. hash & save refresh token
    const hashedRefresh = await bcrypt.hash(tokens.refresh_token, 10);
    await this.authRepo.saveRefreshToken(user.id, hashedRefresh);

    return {
      message: 'Login successful',
      user: {
        id:         user.id,
        email:      user.email,
        first_name: user.first_name,
        last_name:  user.last_name,
        role:       user.role,
      },
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.authRepo.clearRefreshToken(userId);
    return { message: 'Logged out successfully' };
  }

  async refreshTokens(userId: string, email: string, role: string, rawRefreshToken: string) {
    // 1. get user with stored refresh token
    const user = await this.authRepo.findById(userId);
    if (!user || !user.refresh_token) {
      throw new ForbiddenException('Access denied');
    }

    // 2. compare raw token with stored hash
    const tokenMatch = await bcrypt.compare(rawRefreshToken, user.refresh_token);
    if (!tokenMatch) throw new ForbiddenException('Access denied');

    // 3. generate fresh tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // 4. save new hashed refresh token
    const hashedRefresh = await bcrypt.hash(tokens.refresh_token, 10);
    await this.authRepo.saveRefreshToken(user.id, hashedRefresh);

    return tokens;
  }

  async getMe(userId: string) {
    return this.authRepo.findByIdSafe(userId);
  }

  private async generateTokens(userId: string, email: string, role: string) {
  const payload: JwtPayload = { sub: userId, email, role };

  const [access_token, refresh_token] = await Promise.all([
    this.jwtService.signAsync(payload, {
      secret:    this.config.get<string>('JWT_ACCESS_SECRET')!,       
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES') as any, 
    }),
    this.jwtService.signAsync(payload, {
      secret:    this.config.get<string>('JWT_REFRESH_SECRET')!,      
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES') as any,
    }),
  ]);

  return { access_token, refresh_token };
}
}