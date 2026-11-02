import { ConflictException } from '@nestjs/common';
import { createTestDatabase } from '../../test/create-test-database.js';
import { UsersService } from './users.service.js';

const dto = {
  name: 'Maria Silva',
  email: 'Maria@Email.com',
  phone: '11987654321',
  password: 'senhaSegura123',
};

describe('UsersService', () => {
  let service: UsersService;
  let close: () => Promise<void>;

  beforeEach(async () => {
    const database = await createTestDatabase();
    close = database.close;
    service = new UsersService(database.db);
  });

  afterEach(async () => {
    await close();
  });

  it('creates a user with a hashed password and normalized email', async () => {
    const user = await service.create(dto);

    expect(user.email).toBe('maria@email.com');
    expect(user.passwordHash).not.toBe(dto.password);
    expect(await service.findById(user.id)).toEqual(user);
    expect(await service.findByEmail('MARIA@email.com')).toEqual(user);
  });

  it('returns undefined for unknown users', async () => {
    expect(await service.findByEmail('x@email.com')).toBeUndefined();
    expect(
      await service.findById('00000000-0000-4000-8000-000000000000'),
    ).toBeUndefined();
  });

  it('rejects a duplicated email regardless of case', async () => {
    await service.create(dto);

    await expect(
      service.create({ ...dto, email: 'maria@email.COM' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('maps the unique constraint violation to a conflict', async () => {
    await service.create(dto);
    // Simulates a concurrent signup that passes the pre-check.
    vi.spyOn(service, 'findByEmail').mockResolvedValue(undefined);

    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
  });
});
