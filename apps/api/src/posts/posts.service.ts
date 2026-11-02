import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { and, count, desc, eq, sql } from 'drizzle-orm';
import { isForeignKeyViolation } from '../common/database-errors.js';
import { DRIZZLE, type Database } from '../database/database.constants.js';
import { comments, postLikes, posts, users } from '../database/schema.js';
import type { CreatePostDto } from './dto/create-post.dto.js';
import type { ListPostsQueryDto } from './dto/list-posts-query.dto.js';
import type { PostDetails } from './post.entity.js';
import {
  ThumbnailStorageService,
  type ThumbnailFile,
} from './thumbnail-storage.service.js';

const likesCount = sql<number>`(select count(*)::int from ${postLikes} where ${postLikes.postId} = ${posts.id})`;
const commentsCount = sql<number>`(select count(*)::int from ${comments} where ${comments.postId} = ${posts.id})`;

function postColumns(viewerId?: string) {
  return {
    id: posts.id,
    title: posts.title,
    description: posts.description,
    code: posts.code,
    thumbnailUrl: posts.thumbnailUrl,
    tags: posts.tags,
    createdAt: posts.createdAt,
    authorId: users.id,
    authorName: users.name,
    likesCount,
    commentsCount,
    likedByMe: viewerId
      ? sql<boolean>`exists (select 1 from ${postLikes} where ${postLikes.postId} = ${posts.id} and ${postLikes.userId} = ${viewerId})`
      : sql<boolean>`false`,
  };
}

@Injectable()
export class PostsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly thumbnails: ThumbnailStorageService,
  ) {}

  async list(
    { q, sort, page, limit }: ListPostsQueryDto,
    viewerId?: string,
  ): Promise<{ posts: PostDetails[]; total: number }> {
    const query = q
      ? sql`websearch_to_tsquery('portuguese', normalize_search(${q}))`
      : undefined;
    const where = query ? sql`${posts.searchVector} @@ ${query}` : undefined;

    const recency = [desc(posts.createdAt), desc(posts.id)];
    const orderBy =
      sort === 'popular'
        ? [desc(likesCount), ...recency]
        : query
          ? [desc(sql`ts_rank(${posts.searchVector}, ${query})`), ...recency]
          : recency;

    const [rows, [{ total }]] = await Promise.all([
      this.db
        .select(postColumns(viewerId))
        .from(posts)
        .innerJoin(users, eq(posts.authorId, users.id))
        .where(where)
        .orderBy(...orderBy)
        .limit(limit)
        .offset((page - 1) * limit),
      this.db.select({ total: count() }).from(posts).where(where),
    ]);
    return { posts: rows, total };
  }

  async findById(id: string, viewerId?: string): Promise<PostDetails> {
    const [post] = await this.db
      .select(postColumns(viewerId))
      .from(posts)
      .innerJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.id, id));
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async assertExists(id: string): Promise<void> {
    const [post] = await this.db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, id));
    if (!post) {
      throw new NotFoundException('Post not found');
    }
  }

  async create(
    dto: CreatePostDto,
    authorId: string,
    thumbnail?: ThumbnailFile,
  ): Promise<PostDetails> {
    const thumbnailUrl = thumbnail
      ? await this.thumbnails.save(thumbnail)
      : null;

    try {
      const [{ id }] = await this.db
        .insert(posts)
        .values({
          authorId,
          title: dto.title,
          description: dto.description,
          code: dto.code?.trim() ? dto.code : null,
          tags: dto.tags ?? [],
          thumbnailUrl,
        })
        .returning({ id: posts.id });
      return await this.findById(id, authorId);
    } catch (err) {
      if (thumbnailUrl) {
        await this.thumbnails.remove(thumbnailUrl);
      }
      // O JWT continua válido mesmo se o usuário for removido do banco.
      if (isForeignKeyViolation(err)) {
        throw new UnauthorizedException();
      }
      throw err;
    }
  }

  async like(postId: string, userId: string): Promise<number> {
    await this.assertExists(postId);
    try {
      await this.db
        .insert(postLikes)
        .values({ postId, userId })
        .onConflictDoNothing();
    } catch (err) {
      if (isForeignKeyViolation(err)) {
        throw new UnauthorizedException();
      }
      throw err;
    }
    return this.countLikes(postId);
  }

  async unlike(postId: string, userId: string): Promise<void> {
    await this.assertExists(postId);
    await this.db
      .delete(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
  }

  async popularTags(
    limit: number,
  ): Promise<{ name: string; postsCount: number }[]> {
    return this.db
      .select({
        name: sql<string>`min(t.tag)`,
        postsCount: sql<number>`count(*)::int`,
      })
      .from(sql`(select unnest(${posts.tags}) as tag from ${posts}) as t`)
      .groupBy(sql`lower(t.tag)`)
      .orderBy(sql`count(*) desc`, sql`lower(t.tag)`)
      .limit(limit);
  }

  private async countLikes(postId: string): Promise<number> {
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(postLikes)
      .where(eq(postLikes.postId, postId));
    return total;
  }
}
