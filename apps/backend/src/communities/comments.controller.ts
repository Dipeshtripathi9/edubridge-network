import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('comments')
@ApiBearerAuth()
@Controller()
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Post('posts/:postId/comments')
  @ApiOperation({ summary: 'Add a comment / reply' })
  create(
    @Param('postId') postId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateCommentDto,
  ) {
    return this.comments.createComment(postId, user.sub, dto, user.role);
  }

  @Public()
  @Get('posts/:postId/comments')
  @ApiOperation({ summary: 'List threaded comments for a post' })
  list(
    @Param('postId') postId: string,
    @Query() query: PaginationDto,
    @CurrentUser('sub') userId?: string,
    @CurrentUser('role') role?: string,
  ) {
    return this.comments.listComments(postId, query, userId, role);
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: 'Delete a comment (author or moderator)' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.comments.deleteComment(id, user.sub, user.role);
  }

  @Post('comments/:id/like')
  @ApiOperation({ summary: 'Toggle like on a comment' })
  like(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.comments.toggleCommentLike(id, userId);
  }

  @Post('comments/:id/helpful')
  @ApiOperation({ summary: 'Mark/unmark a comment as the helpful answer' })
  helpful(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.comments.markHelpful(id, user.sub, user.role);
  }
}
