import { createTestDatabase } from '../../test/create-test-database.js';
import { users } from '../database/schema.js';
import { PostsService } from '../posts/posts.service.js';
import { ThumbnailStorageService } from '../posts/thumbnail-storage.service.js';
import { CommentsService } from './comments.service.js';

const MISSING_ID = '00000000-0000-4000-8000-000000000000';

describe('CommentsService', () => {
  let service: CommentsService;
  let postsService: PostsService;
  let close: () => Promise<void>;
  let authorId: string;
  let postId: string;

  const page = { page: 1, limit: 20 };

  beforeEach(async () => {
    const database = await createTestDatabase();
    close = database.close;
    postsService = new PostsService(database.db, new ThumbnailStorageService());
    service = new CommentsService(database.db, postsService);

    const [author] = await database.db
      .insert(users)
      .values({
        name: 'Maria Silva',
        email: 'maria@email.com',
        phone: '11987654321',
        passwordHash: 'hash',
      })
      .returning();
    authorId = author.id;
    postId = (
      await postsService.create(
        { title: 'Título', description: 'Descrição' },
        authorId,
      )
    ).id;
  });

  afterEach(async () => {
    await close();
  });

  it('nests replies under their root and counts every comment on the post', async () => {
    const root = await service.create(postId, { content: 'Raiz' }, authorId);
    const reply = await service.create(
      postId,
      { content: 'Resposta', parentId: root.id },
      authorId,
    );

    const { comments, total } = await service.list(postId, page);

    expect(total).toBe(1);
    expect(comments[0].id).toBe(root.id);
    expect(comments[0].replies.map((item) => item.id)).toEqual([reply.id]);
    expect((await postsService.findById(postId)).commentsCount).toBe(2);
  });

  it('flattens a reply to a reply into the root comment', async () => {
    const root = await service.create(postId, { content: 'Raiz' }, authorId);
    const reply = await service.create(
      postId,
      { content: 'Resposta', parentId: root.id },
      authorId,
    );

    const nested = await service.create(
      postId,
      { content: 'Resposta da resposta', parentId: reply.id },
      authorId,
    );

    expect(nested.parentId).toBe(root.id);
  });

  it('rejects a parent from another post', async () => {
    const otherPost = await postsService.create(
      { title: 'Outro', description: 'Outro' },
      authorId,
    );
    const foreign = await service.create(
      otherPost.id,
      { content: 'Em outro post' },
      authorId,
    );

    await expect(
      service.create(
        postId,
        { content: 'Resposta', parentId: foreign.id },
        authorId,
      ),
    ).rejects.toMatchObject({ status: 422 });
  });

  it('answers 404 for an unknown post and 401 for a removed user', async () => {
    await expect(service.list(MISSING_ID, page)).rejects.toMatchObject({
      status: 404,
    });
    await expect(
      service.create(MISSING_ID, { content: 'Oi' }, authorId),
    ).rejects.toMatchObject({ status: 404 });
    await expect(
      service.create(postId, { content: 'Oi' }, MISSING_ID),
    ).rejects.toMatchObject({ status: 401 });
  });
});
