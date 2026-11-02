import {
  Inject,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { and, asc, count, eq, inArray, isNull } from 'drizzle-orm';
import { isForeignKeyViolation } from '../common/database-errors.js';
import type { PaginationQueryDto } from '../common/pagination.dto.js';
import { DRIZZLE, type Database } from '../database/database.constants.js';
import { comments, users } from '../database/schema.js';
import { PostsService } from '../posts/posts.service.js';
import type { CommentDetails, CommentThread } from './comment.entity.js';
import type { CreateCommentDto } from './dto/create-comment.dto.js';

const commentColumns = {
  id: comments.id,
  parentId: comments.parentId,
  content: comments.content,
  createdAt: comments.createdAt,
  authorId: users.id,
  authorName: users.name,
};

@Injectable()
export class CommentsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly postsService: PostsService,
  ) {}

  async list(
    postId: string,
    { page, limit }: PaginationQueryDto,
  ): Promise<{ comments: CommentThread[]; total: number }> {
    await this.postsService.assertExists(postId);
    const isRoot = and(eq(comments.postId, postId), isNull(comments.parentId));

    const [roots, [{ total }]] = await Promise.all([
      this.db
        .select(commentColumns)
        .from(comments)
        .innerJoin(users, eq(comments.authorId, users.id))
        .where(isRoot)
        .orderBy(asc(comments.createdAt), asc(comments.id))
        .limit(limit)
        .offset((page - 1) * limit),
      this.db.select({ total: count() }).from(comments).where(isRoot),
    ]);

    const replies = roots.length
      ? await this.db
          .select(commentColumns)
          .from(comments)
          .innerJoin(users, eq(comments.authorId, users.id))
          .where(
            inArray(
              comments.parentId,
              roots.map((root) => root.id),
            ),
          )
          .orderBy(asc(comments.createdAt), asc(comments.id))
      : [];

    return {
      comments: roots.map((root) => ({
        ...root,
        replies: replies.filter((reply) => reply.parentId === root.id),
      })),
      total,
    };
  }

  async create(
    postId: string,
    dto: CreateCommentDto,
    authorId: string,
  ): Promise<CommentDetails> {
    await this.postsService.assertExists(postId);
    const parentId = dto.parentId
      ? await this.resolveRootId(postId, dto.parentId)
      : null;

    try {
      const [{ id }] = await this.db
        .insert(comments)
        .values({ postId, authorId, parentId, content: dto.content })
        .returning({ id: comments.id });
      const [comment] = await this.db
        .select(commentColumns)
        .from(comments)
        .innerJoin(users, eq(comments.authorId, users.id))
        .where(eq(comments.id, id));
      return comment;
    } catch (err) {
      // O JWT continua válido mesmo se o usuário for removido do banco.
      if (isForeignKeyViolation(err)) {
        throw new UnauthorizedException();
      }
      throw err;
    }
  }

  /** As respostas têm um único nível: responder a uma resposta vai para a raiz. */
  private async resolveRootId(
    postId: string,
    parentId: string,
  ): Promise<string> {
    const [parent] = await this.db
      .select({ id: comments.id, parentId: comments.parentId })
      .from(comments)
      .where(and(eq(comments.id, parentId), eq(comments.postId, postId)));
    if (!parent) {
      throw new UnprocessableEntityException({
        statusCode: 422,
        message: 'Validation failed',
        errors: [
          {
            field: 'parentId',
            messages: ['parentId must be a comment of this post'],
          },
        ],
      });
    }
    return parent.parentId ?? parent.id;
  }
}
