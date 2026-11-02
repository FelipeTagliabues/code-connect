import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/error-response.dto.js';
import { PaginationQueryDto } from '../common/pagination.dto.js';
import { TagsResponseDto } from './dto/post-response.dto.js';
import { PostsService } from './posts.service.js';

@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar as tags mais usadas' })
  @ApiOkResponse({ type: TagsResponseDto })
  @ApiUnprocessableEntityResponse({ type: ErrorResponseDto })
  async list(@Query() { limit }: PaginationQueryDto): Promise<TagsResponseDto> {
    return { data: await this.postsService.popularTags(limit) };
  }
}
