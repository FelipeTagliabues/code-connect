import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createTestDatabase } from '../../test/create-test-database.js';
import type { Database } from '../database/database.constants.js';
import { users } from '../database/schema.js';
import type { CreatePostDto } from './dto/create-post.dto.js';
import { PostsService } from './posts.service.js';
import { ThumbnailStorageService } from './thumbnail-storage.service.js';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const MISSING_ID = '00000000-0000-4000-8000-000000000000';

describe('PostsService', () => {
  let service: PostsService;
  let db: Database;
  let close: () => Promise<void>;
  let authorId: string;
  let otherId: string;

  const createUser = async (email: string) => {
    const [user] = await db
      .insert(users)
      .values({
        name: 'Maria Silva',
        email,
        phone: '11987654321',
        passwordHash: 'hash',
      })
      .returning();
    return user.id;
  };

  const createPost = (dto: Partial<CreatePostDto> = {}) =>
    service.create(
      { title: 'Título', description: 'Descrição', ...dto },
      authorId,
    );

  const search = (q?: string, sort: 'recent' | 'popular' = 'recent') =>
    service.list({ q, sort, page: 1, limit: 20 });

  beforeEach(async () => {
    const database = await createTestDatabase();
    db = database.db;
    close = database.close;
    service = new PostsService(db, new ThumbnailStorageService());
    authorId = await createUser('maria@email.com');
    otherId = await createUser('joao@email.com');
  });

  afterEach(async () => {
    await close();
  });

  describe('search', () => {
    it('uses Portuguese stemming', async () => {
      await createPost({ title: 'Criando componentes reutilizáveis' });

      const { posts } = await search('componente');

      expect(posts).toHaveLength(1);
    });

    it('ignores accents on both sides', async () => {
      await createPost({ title: 'Programação funcional' });
      await createPost({ title: 'Acao rapida' });

      expect((await search('programacao')).posts).toHaveLength(1);
      expect((await search('ação')).posts).toHaveLength(1);
    });

    it('finds posts by tag and by description', async () => {
      await createPost({ title: 'Primeiro', tags: ['Front-end'] });
      await createPost({ title: 'Segundo', description: 'Tudo sobre Docker' });
      await createPost({ title: 'Terceiro' });

      expect((await search('"Front-end"')).posts[0].title).toBe('Primeiro');
      expect((await search('docker')).posts[0].title).toBe('Segundo');
      expect((await search('kubernetes')).total).toBe(0);
    });

    it('requires every term and ranks title above description', async () => {
      await createPost({ title: 'Outro', description: 'Fala de tabelas' });
      await createPost({
        title: 'Tabelas',
        description: 'Fala de outra coisa',
      });
      await createPost({ title: 'Tabelas e Docker' });

      const { posts } = await search('tabelas');
      expect(posts[0].title).toMatch(/^Tabelas/);
      expect(posts.at(-1)?.title).toBe('Outro');

      const both = await search('tabelas docker');
      expect(both.posts.map((post) => post.title)).toEqual([
        'Tabelas e Docker',
      ]);
    });
  });

  describe('list', () => {
    it('sorts by recency by default and paginates with the total', async () => {
      const first = await createPost({ title: 'Primeiro' });
      const second = await createPost({ title: 'Segundo' });
      const third = await createPost({ title: 'Terceiro' });

      const pageOne = await service.list({
        sort: 'recent',
        page: 1,
        limit: 2,
      });
      const pageTwo = await service.list({
        sort: 'recent',
        page: 2,
        limit: 2,
      });

      expect(pageOne.total).toBe(3);
      expect(pageOne.posts.map((post) => post.id)).toEqual([
        third.id,
        second.id,
      ]);
      expect(pageTwo.posts.map((post) => post.id)).toEqual([first.id]);
    });

    it('sorts by likes when popular', async () => {
      await createPost({ title: 'Sem curtidas' });
      const liked = await createPost({ title: 'Curtido' });
      await service.like(liked.id, otherId);

      const { posts } = await search(undefined, 'popular');

      expect(posts[0].id).toBe(liked.id);
      expect(posts[0].likesCount).toBe(1);
    });

    it('only marks likedByMe for the viewer who liked', async () => {
      const post = await createPost();
      await service.like(post.id, otherId);

      const asLiker = await service.findById(post.id, otherId);
      const asAuthor = await service.findById(post.id, authorId);
      const asVisitor = await service.findById(post.id);

      expect(asLiker.likedByMe).toBe(true);
      expect(asAuthor.likedByMe).toBe(false);
      expect(asVisitor.likedByMe).toBe(false);
    });
  });

  describe('likes', () => {
    it('is idempotent when liking and unliking', async () => {
      const post = await createPost();

      await service.like(post.id, otherId);
      expect(await service.like(post.id, otherId)).toBe(1);

      await service.unlike(post.id, otherId);
      await service.unlike(post.id, otherId);
      expect((await service.findById(post.id)).likesCount).toBe(0);
    });

    it('rejects unknown posts and removed users', async () => {
      const post = await createPost();

      await expect(service.like(MISSING_ID, otherId)).rejects.toMatchObject({
        status: 404,
      });
      await expect(service.like(post.id, MISSING_ID)).rejects.toMatchObject({
        status: 401,
      });
    });
  });

  describe('create', () => {
    let uploadsDir: string;

    beforeEach(async () => {
      uploadsDir = await mkdtemp(join(tmpdir(), 'uploads-'));
      vi.stubEnv('UPLOADS_DIR', uploadsDir);
    });

    afterEach(async () => {
      vi.unstubAllEnvs();
      await rm(uploadsDir, { recursive: true, force: true });
    });

    it('stores a null thumbnail and blank code as null', async () => {
      const post = await createPost({ code: '   ' });

      expect(post.thumbnailUrl).toBeNull();
      expect(post.code).toBeNull();
      expect(post.tags).toEqual([]);
    });

    it('saves a valid image and rejects a fake one', async () => {
      const post = await service.create(
        { title: 'Título', description: 'Descrição' },
        authorId,
        { buffer: PNG },
      );
      expect(post.thumbnailUrl).toMatch(/^\/uploads\/[\w-]+\.png$/);
      expect(await readdir(uploadsDir)).toHaveLength(1);

      await expect(
        service.create(
          { title: 'Título', description: 'Descrição' },
          authorId,
          { buffer: Buffer.from('<svg></svg>') },
        ),
      ).rejects.toMatchObject({ status: 422 });
      expect(await readdir(uploadsDir)).toHaveLength(1);
    });

    it('removes the image and answers 401 when the author no longer exists', async () => {
      await expect(
        service.create(
          { title: 'Título', description: 'Descrição' },
          MISSING_ID,
          { buffer: PNG },
        ),
      ).rejects.toMatchObject({ status: 401 });

      expect(await readdir(uploadsDir)).toHaveLength(0);
    });
  });

  it('lists the most used tags ignoring case', async () => {
    await createPost({ tags: ['React', 'CSS'] });
    await createPost({ tags: ['react'] });

    const tags = await service.popularTags(1);

    expect(tags).toHaveLength(1);
    expect(tags[0].postsCount).toBe(2);
    expect(tags[0].name.toLowerCase()).toBe('react');
  });
});
