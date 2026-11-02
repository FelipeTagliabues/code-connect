import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { extractTokenFromHeader, type JwtPayload } from './auth.guard.js';

export type OptionalAuthRequest = Request & { user?: JwtPayload };

/** Rotas públicas: token ausente ou inválido segue como visitante, nunca 401. */
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<OptionalAuthRequest>();
    const token = extractTokenFromHeader(request);
    if (token) {
      try {
        request.user = await this.jwtService.verifyAsync<JwtPayload>(token);
      } catch {
        request.user = undefined;
      }
    }
    return true;
  }
}
