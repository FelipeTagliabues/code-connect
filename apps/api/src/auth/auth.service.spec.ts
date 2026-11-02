import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createTestDatabase } from '../../test/create-test-database.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let users: UsersService;
  let jwt: JwtService;
  let service: AuthService;
  let close: () => Promise<void>;

  beforeEach(async () => {
    const database = await createTestDatabase();
    close = database.close;
    users = new UsersService(database.db);
    jwt = new JwtService({ secret: 'test-secret' });
    service = new AuthService(users, jwt);
    await users.create({
      name: 'Maria Silva',
      email: 'maria@email.com',
      phone: '11987654321',
      password: 'senhaSegura123',
    });
  });

  afterEach(async () => {
    await close();
  });

  it('returns a token whose subject is the user id', async () => {
    const result = await service.signIn('maria@email.com', 'senhaSegura123');
    const payload = await jwt.verifyAsync<{ sub: string }>(result.accessToken);

    expect(result.tokenType).toBe('Bearer');
    expect(payload.sub).toBe((await users.findByEmail('maria@email.com'))?.id);
  });

  it('rejects a wrong password', async () => {
    await expect(
      service.signIn('maria@email.com', 'errada'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an unknown email', async () => {
    await expect(
      service.signIn('x@email.com', 'senhaSegura123'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
