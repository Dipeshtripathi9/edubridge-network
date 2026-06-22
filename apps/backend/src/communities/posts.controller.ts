import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { FeedQueryDto } from './dto/query.dto';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

class VotePollDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  optionIds!: string[];
}

@ApiTags('posts')
@ApiBearerAuth()
@Controller()
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Post('communities/:slug/posts')
  @ApiOperation({ summary: 'Create a post in a community' })
  create(@CurrentUser() user: JwtUser, @Param('slug') slug: string, @Body() dto: CreatePostDto) {
    return this.posts.createPost(user.sub, slug, dto, user.role);
  }

  @Public()
  @Get('communities/:slug/posts')
  @ApiOperation({ summary: 'Get a community feed (cursor paginated)' })
  feed(
    @Param('slug') slug: string,
    @Query() query: FeedQueryDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.posts.getFeed(slug, query, userId);
  }

  @Public()
  @Get('posts/:id')
  @ApiOperation({ summary: 'Get a single post' })
  getOne(@Param('id') id: string, @CurrentUser('sub') userId?: string) {
    return this.posts.getPost(id, userId);
  }

  @Delete('posts/:id')
  @ApiOperation({ summary: 'Delete a post (author or moderator)' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.posts.deletePost(id, user.sub, user.role);
  }

  @Post('posts/:id/like')
  @ApiOperation({ summary: 'Toggle like on a post' })
  like(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.posts.toggleLike(id, userId);
  }

  @Post('posts/:id/bookmark')
  @ApiOperation({ summary: 'Toggle bookmark on a post' })
  bookmark(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.posts.toggleBookmark(id, userId);
  }

  @Post('posts/:id/share')
  @ApiOperation({ summary: 'Increment share count' })
  share(@Param('id') id: string) {
    return this.posts.sharePost(id);
  }

  @Post('posts/:id/pin')
  @ApiOperation({ summary: 'Pin / unpin a post (community moderator or admin)' })
  pin(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.posts.togglePin(id, user.sub, user.role);
  }

  @Post('posts/:id/poll/vote')
  @ApiOperation({ summary: 'Vote on a poll' })
  vote(@Param('id') id: string, @CurrentUser('sub') userId: string, @Body() dto: VotePollDto) {
    return this.posts.votePoll(id, userId, dto.optionIds);
  }
}
