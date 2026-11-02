import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto.js';

export const POST_SORTS = ['recent', 'popular'] as const;
export type PostSort = (typeof POST_SORTS)[number];

export class ListPostsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'react "front-end"',
    description: 'Busca full text no título, nas tags e na descrição.',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({ enum: POST_SORTS, default: 'recent' })
  @IsIn(POST_SORTS)
  sort: PostSort = 'recent';
}
