import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { AuthGuard, type JwtPayload } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { OptionalAuthGuard } from '../auth/optional-auth.guard.js';
import { ErrorResponseDto } from '../common/error-response.dto.js';
import { PaginationMetaDto } from '../common/pagination.dto.js';
import { CreatePostDto, CreatePostFormDto } from './dto/create-post.dto.js';
import { ListPostsQueryDto } from './dto/list-posts-query.dto.js';
import {
  LikeResponseDto,
  PostResponseDto,
  PostsPageDto,
} from './dto/post-response.dto.js';
import { PostsService } from './posts.service.js';
import {
  THUMBNAIL_MAX_BYTES,
  type ThumbnailFile,
} from './thumbnail-storage.service.js';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Listar posts, com busca full text opcional' })
  @ApiOkResponse({ type: PostsPageDto })
  @ApiUnprocessableEntityResponse({ type: ErrorResponseDto })
  async list(
    @Query() query: ListPostsQueryDto,
    @CurrentUser() viewer?: JwtPayload,
  ): Promise<PostsPageDto> {
    const { posts, total } = await this.postsService.list(query, viewer?.sub);
    return {
      data: posts.map((post) => PostResponseDto.fromEntity(post)),
      meta: PaginationMetaDto.from(query, total),
    };
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Obter um post' })
  @ApiOkResponse({ type: PostResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() viewer?: JwtPayload,
  ): Promise<PostResponseDto> {
    return PostResponseDto.fromEntity(
      await this.postsService.findById(id, viewer?.sub),
    );
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      limits: { fileSize: THUMBNAIL_MAX_BYTES, files: 1 },
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePostFormDto })
  @ApiOperation({ summary: 'Publicar um post' })
  @ApiCreatedResponse({ type: PostResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiPayloadTooLargeResponse({ type: ErrorResponseDto })
  @ApiUnprocessableEntityResponse({ type: ErrorResponseDto })
  async create(
    @Body() dto: CreatePostDto,
    @CurrentUser() user: JwtPayload,
    @UploadedFile() thumbnail?: ThumbnailFile,
  ): Promise<PostResponseDto> {
    return PostResponseDto.fromEntity(
      await this.postsService.create(dto, user.sub, thumbnail),
    );
  }

  @Post(':id/likes')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Curtir um post' })
  @ApiCreatedResponse({ type: LikeResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async like(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<LikeResponseDto> {
    return {
      likesCount: await this.postsService.like(id, user.sub),
      likedByMe: true,
    };
  }

  @Delete(':id/likes')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover a curtida de um post' })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async unlike(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.postsService.unlike(id, user.sub);
  }
}
