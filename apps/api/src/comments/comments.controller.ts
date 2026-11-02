import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { AuthGuard, type JwtPayload } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { ErrorResponseDto } from '../common/error-response.dto.js';
import {
  PaginationMetaDto,
  PaginationQueryDto,
} from '../common/pagination.dto.js';
import { CommentsService } from './comments.service.js';
import {
  CommentResponseDto,
  CommentsPageDto,
} from './dto/comment-response.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';

@ApiTags('comments')
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar os comentários de um post' })
  @ApiOkResponse({ type: CommentsPageDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async list(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<CommentsPageDto> {
    const { comments, total } = await this.commentsService.list(postId, query);
    return {
      data: comments.map((comment) => CommentResponseDto.fromEntity(comment)),
      meta: PaginationMetaDto.from(query, total),
    };
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Comentar um post ou responder a um comentário' })
  @ApiCreatedResponse({ type: CommentResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ErrorResponseDto })
  async create(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CommentResponseDto> {
    return CommentResponseDto.fromEntity(
      await this.commentsService.create(postId, dto, user.sub),
    );
  }
}
