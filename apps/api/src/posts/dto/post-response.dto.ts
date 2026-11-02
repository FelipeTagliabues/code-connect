import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/pagination.dto.js';
import type { PostDetails } from '../post.entity.js';

export class AuthorDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Maria Silva' })
  name: string;
}

export class PostResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'React zero to hero' })
  title: string;

  @ApiProperty({ example: 'Um guia do básico ao avançado.' })
  description: string;

  @ApiProperty({ type: String, nullable: true })
  code: string | null;

  @ApiProperty({ type: String, nullable: true, example: '/uploads/a.png' })
  thumbnailUrl: string | null;

  @ApiProperty({ example: ['React'], type: [String] })
  tags: string[];

  @ApiProperty({ type: () => AuthorDto })
  author: AuthorDto;

  @ApiProperty({ example: 12 })
  likesCount: number;

  @ApiProperty({ example: 3 })
  commentsCount: number;

  @ApiProperty({ example: false })
  likedByMe: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  static fromEntity(post: PostDetails): PostResponseDto {
    const dto = new PostResponseDto();
    dto.id = post.id;
    dto.title = post.title;
    dto.description = post.description;
    dto.code = post.code;
    dto.thumbnailUrl = post.thumbnailUrl;
    dto.tags = post.tags;
    dto.author = { id: post.authorId, name: post.authorName };
    dto.likesCount = post.likesCount;
    dto.commentsCount = post.commentsCount;
    dto.likedByMe = post.likedByMe;
    dto.createdAt = post.createdAt;
    return dto;
  }
}

export class PostsPageDto {
  @ApiProperty({ type: () => [PostResponseDto] })
  data: PostResponseDto[];

  @ApiProperty({ type: () => PaginationMetaDto })
  meta: PaginationMetaDto;
}

export class LikeResponseDto {
  @ApiProperty({ example: 13 })
  likesCount: number;

  @ApiProperty({ example: true })
  likedByMe: boolean;
}

export class TagDto {
  @ApiProperty({ example: 'React' })
  name: string;

  @ApiProperty({ example: 8 })
  postsCount: number;
}

export class TagsResponseDto {
  @ApiProperty({ type: () => [TagDto] })
  data: TagDto[];
}
