import { Module } from '@nestjs/common';
import { PostsModule } from '../posts/posts.module.js';
import { CommentsController } from './comments.controller.js';
import { CommentsService } from './comments.service.js';

@Module({
  imports: [PostsModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
