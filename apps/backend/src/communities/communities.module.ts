import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { ReputationModule } from '../reputation/reputation.module';
import { CommunitiesController } from './communities.controller';
import { PostsController } from './posts.controller';
import { CommentsController } from './comments.controller';
import { CommunitiesService } from './communities.service';
import { PostsService } from './posts.service';
import { CommentsService } from './comments.service';

@Module({
  imports: [NotificationsModule, ReputationModule],
  controllers: [CommunitiesController, PostsController, CommentsController],
  providers: [CommunitiesService, PostsService, CommentsService],
  exports: [CommunitiesService, PostsService, CommentsService],
})
export class CommunitiesModule {}
