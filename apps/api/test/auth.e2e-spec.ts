import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { DRIZZLE, PG_POOL } from './../src/database/database.constants.js';
import { createTestDatabase } from './create-test-database.js';
import { configureApp } from './../src/common/configure-app.js';

const body = {
  name: 'Maria Silva',
  email: 'maria@email.com',
  phone: '(11) 98765-4321',
  password: 'senhaSegura123',
};

describe('Users and sessions (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const database = await createTestDatabase();
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PG_POOL)
      .useValue({ end: database.close })
      .overrideProvider(DRIZZLE)
      .useValue(database.db)
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('registers, logs in and reads the current user', async () => {
    const created = await request(app.getHttpServer())
      .post('/users')
      .send(body)
      .expect(201);
    expect(created.body).toMatchObject({
      name: body.name,
      email: body.email,
      phone: '11987654321',
    });
    expect(created.body).not.toHaveProperty('password');
    expect(created.body).not.toHaveProperty('passwordHash');

    const session = await request(app.getHttpServer())
      .post('/sessions')
      .send({ email: body.email, password: body.password })
      .expect(201);
    expect(session.body.tokenType).toBe('Bearer');

    const me = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${session.body.accessToken}`)
      .expect(200);
    expect(me.body.id).toBe(created.body.id);
  });

  it('returns 409 for a duplicated email', async () => {
    await request(app.getHttpServer()).post('/users').send(body).expect(201);
    await request(app.getHttpServer()).post('/users').send(body).expect(409);
  });

  it('returns 422 with errors for an invalid payload', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ name: '', email: 'x', phone: '1', password: '1' })
      .expect(422);
    expect(res.body.statusCode).toBe(422);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('returns 401 for wrong credentials and for /users/me without token', async () => {
    await request(app.getHttpServer()).post('/users').send(body).expect(201);
    await request(app.getHttpServer())
      .post('/sessions')
      .send({ email: body.email, password: 'errada123' })
      .expect(401);
    await request(app.getHttpServer()).get('/users/me').expect(401);
  });
});
