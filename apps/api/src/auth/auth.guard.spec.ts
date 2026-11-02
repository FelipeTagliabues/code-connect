import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard.js';

function contextWith(request: object): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  const jwt = new JwtService({ secret: 'test-secret' });
  const guard = new AuthGuard(jwt);

  it('rejects a request without Authorization header', async () => {
    await expect(
      guard.canActivate(contextWith({ headers: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an invalid token', async () => {
    const request = { headers: { authorization: 'Bearer invalid' } };

    await expect(
      guard.canActivate(contextWith(request)),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts a valid token and exposes the payload', async () => {
    const token = await jwt.signAsync({ sub: 'u1', email: 'a@b.com' });
    const request: Record<string, unknown> = {
      headers: { authorization: `Bearer ${token}` },
    };

    await expect(guard.canActivate(contextWith(request))).resolves.toBe(true);
    expect(request.user).toMatchObject({ sub: 'u1', email: 'a@b.com' });
  });
});
