import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { isUniqueViolation } from '../common/database-errors.js';
import { DRIZZLE, type Database } from '../database/database.constants.js';
import { users } from '../database/schema.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { User } from './user.entity.js';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(dto: CreateUserDto): Promise<User> {
    const email = dto.email.trim().toLowerCase();
    if (await this.findByEmail(email)) {
      throw new ConflictException('Email already registered');
    }

    try {
      const [user] = await this.db
        .insert(users)
        .values({
          name: dto.name.trim(),
          email,
          phone: dto.phone,
          passwordHash: await hash(dto.password, 10),
        })
        .returning();
      return user;
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new ConflictException('Email already registered');
      }
      throw err;
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const normalized = email.trim().toLowerCase();
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, normalized));
    return user;
  }

  async findById(id: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user;
  }
}
