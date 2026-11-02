import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/common/configure-app.js';
import { DRIZZLE, PG_POOL } from '../src/database/database.constants.js';
import { createTestDatabase } from './create-test-database.js';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const MISSING_ID = '00000000-0000-4000-8000-000000000000';

describe('Posts, likes and comments (e2e)', () => {
  let app: INestApplication<App>;
  let uploadsDir: string;
  let token: string;

  const server = () => app.getHttpServer();
  const bearer = () => `Bearer ${token}`;

  const createPost = async (title = 'Componentes acessíveis') => {
    const { body } = await request(server())
      .post('/posts')
      .set('Authorization', bearer())
      .field('title', title)
      .field('description', 'Descrição do post')
      .field('tags', 'React')
      .expect(201);
    return body as { id: string; tags: string[]; thumbnailUrl: string | null };
  };

  beforeEach(async () => {
    uploadsDir = await mkdtemp(join(tmpdir(), 'uploads-'));
    vi.stubEnv('UPLOADS_DIR', uploadsDir);

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

    const credentials = {
      email: 'maria@email.com',
      password: 'senhaSegura123',
    };
    await request(server())
      .post('/users')
      .send({ ...credentials, name: 'Maria Silva', phone: '11987654321' })
      .expect(201);
    const session = await request(server())
      .post('/sessions')
      .send(credentials)
      .expect(201);
    token = session.body.accessToken;
  });

  afterEach(async () => {
    await app.close();
    vi.unstubAllEnvs();
    await rm(uploadsDir, { recursive: true, force: true });
  });

  describe('as a visitor', () => {
    it('reads posts, comments and tags', async () => {
      const post = await createPost();

      const feed = await request(server()).get('/posts').expect(200);
      expect(feed.body.meta).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
      expect(feed.body.data[0]).toMatchObject({
        id: post.id,
        author: { name: 'Maria Silva' },
        likedByMe: false,
        likesCount: 0,
        commentsCount: 0,
      });
      expect(feed.body.data[0].author.email).toBeUndefined();

      await request(server()).get(`/posts/${post.id}`).expect(200);
      await request(server()).get(`/posts/${post.id}/comments`).expect(200);

      const tags = await request(server()).get('/tags').expect(200);
      expect(tags.body.data).toEqual([{ name: 'React', postsCount: 1 }]);
    });

    it('cannot publish, like or comment', async () => {
      const post = await createPost();

      await request(server()).post('/posts').expect(401);
      await request(server()).post(`/posts/${post.id}/likes`).expect(401);
      await request(server()).delete(`/posts/${post.id}/likes`).expect(401);
      await request(server())
        .post(`/posts/${post.id}/comments`)
        .send({ content: 'Oi' })
        .expect(401);
    });

    it('treats an invalid token as a visitor on public routes', async () => {
      await createPost();

      const { body } = await request(server())
        .get('/posts')
        .set('Authorization', 'Bearer token-invalido')
        .expect(200);

      expect(body.data).toHaveLength(1);
    });
  });

  describe('as a logged user', () => {
    it('likes and unlikes a post', async () => {
      const post = await createPost();

      const like = await request(server())
        .post(`/posts/${post.id}/likes`)
        .set('Authorization', bearer())
        .expect(201);
      expect(like.body).toEqual({ likesCount: 1, likedByMe: true });

      const liked = await request(server())
        .get(`/posts/${post.id}`)
        .set('Authorization', bearer())
        .expect(200);
      expect(liked.body.likedByMe).toBe(true);

      await request(server())
        .delete(`/posts/${post.id}/likes`)
        .set('Authorization', bearer())
        .expect(204);
    });

    it('comments and replies', async () => {
      const post = await createPost();

      const root = await request(server())
        .post(`/posts/${post.id}/comments`)
        .set('Authorization', bearer())
        .send({ content: '  Raiz  ' })
        .expect(201);
      expect(root.body.content).toBe('Raiz');

      await request(server())
        .post(`/posts/${post.id}/comments`)
        .set('Authorization', bearer())
        .send({ content: 'Resposta', parentId: root.body.id })
        .expect(201);

      const { body } = await request(server())
        .get(`/posts/${post.id}/comments`)
        .expect(200);
      expect(body.meta.total).toBe(1);
      expect(body.data[0].replies[0].content).toBe('Resposta');
    });

    it('publishes with a thumbnail and serves the file', async () => {
      const { body } = await request(server())
        .post('/posts')
        .set('Authorization', bearer())
        .field('title', 'Com imagem')
        .field('description', 'Descrição')
        .field('tags', 'React')
        .field('tags', 'react')
        .field('tags', 'CSS')
        .attach('thumbnail', PNG, 'imagem.png')
        .expect(201);

      expect(body.tags).toEqual(['React', 'CSS']);
      expect(body.thumbnailUrl).toMatch(/^\/uploads\/.+\.png$/);

      const image = await request(server()).get(body.thumbnailUrl).expect(200);
      expect(image.headers['x-content-type-options']).toBe('nosniff');
    });

    it('rejects a file that is not an image, even named as one', async () => {
      await request(server())
        .post('/posts')
        .set('Authorization', bearer())
        .field('title', 'Título')
        .field('description', 'Descrição')
        .attach('thumbnail', Buffer.from('<svg></svg>'), {
          filename: 'imagem.png',
          contentType: 'image/png',
        })
        .expect(422);
    });

    it('rejects a thumbnail above the size limit', async () => {
      await request(server())
        .post('/posts')
        .set('Authorization', bearer())
        .field('title', 'Título')
        .field('description', 'Descrição')
        .attach(
          'thumbnail',
          Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024)]),
          'a.png',
        )
        .expect(413);
    });

    it('validates the payload', async () => {
      const { body } = await request(server())
        .post('/posts')
        .set('Authorization', bearer())
        .field('title', '   ')
        .expect(422);

      expect(body.statusCode).toBe(422);
      expect(
        body.errors.map((error: { field: string }) => error.field),
      ).toEqual(expect.arrayContaining(['title', 'description']));
    });
  });

  describe('search and errors', () => {
    it('filters with full text search through ?q=', async () => {
      await createPost('Componentes acessíveis');
      await createPost('Banco de dados');

      const { body } = await request(server())
        .get('/posts')
        .query({ q: 'componente' })
        .expect(200);

      expect(body.meta.total).toBe(1);
      expect(body.data[0].title).toBe('Componentes acessíveis');
    });

    it('answers 404, 400 and 422 where due', async () => {
      await request(server()).get(`/posts/${MISSING_ID}`).expect(404);
      await request(server()).get('/posts/nao-e-uuid').expect(400);
      await request(server()).get('/posts').query({ page: 0 }).expect(422);
      await request(server()).get('/posts').query({ sort: 'x' }).expect(422);
      await request(server()).get(`/posts/${MISSING_ID}/comments`).expect(404);
    });
  });
});
