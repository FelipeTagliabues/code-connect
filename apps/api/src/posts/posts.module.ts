import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller.js';
import { PostsService } from './posts.service.js';
import { TagsController } from './tags.controller.js';
import { ThumbnailStorageService } from './thumbnail-storage.service.js';

@Module({
  controllers: [PostsController, TagsController],
  providers: [PostsService, ThumbnailStorageService],
  exports: [PostsService],
})
export class PostsModule {}
