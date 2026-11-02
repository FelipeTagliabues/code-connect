import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { UsersService } from '../users/users.service.js';
import { getJwtExpiresInSeconds } from './auth.constants.js';
import type { AccessTokenDto } from './dto/access-token.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string): Promise<AccessTokenDto> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !(await compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });
    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: getJwtExpiresInSeconds(),
    };
  }
}
