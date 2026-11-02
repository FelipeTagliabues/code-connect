import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/pagination.dto.js';
import { AuthorDto } from '../../posts/dto/post-response.dto.js';
import type { CommentDetails, CommentThread } from '../comment.entity.js';

export class CommentResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid', type: String, nullable: true })
  parentId: string | null;

  @ApiProperty({ example: 'Achei muito bom seu código!' })
  content: string;

  @ApiProperty({ type: () => AuthorDto })
  author: AuthorDto;

  @ApiProperty({ type: () => [CommentResponseDto] })
  replies: CommentResponseDto[];

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  static fromEntity(
    comment: CommentDetails & Partial<CommentThread>,
  ): CommentResponseDto {
    const dto = new CommentResponseDto();
    dto.id = comment.id;
    dto.parentId = comment.parentId;
    dto.content = comment.content;
    dto.author = { id: comment.authorId, name: comment.authorName };
    dto.replies = (comment.replies ?? []).map((reply) =>
      CommentResponseDto.fromEntity(reply),
    );
    dto.createdAt = comment.createdAt;
    return dto;
  }
}

export class CommentsPageDto {
  @ApiProperty({ type: () => [CommentResponseDto] })
  data: CommentResponseDto[];

  @ApiProperty({ type: () => PaginationMetaDto })
  meta: PaginationMetaDto;
}
