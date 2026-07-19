import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, ReviewQueryDto, VoteReviewDto } from './dto/review.dto';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('reviews')
@ApiBearerAuth()
@Controller()
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Post('colleges/:collegeId/reviews')
  @ApiOperation({ summary: 'Post a review (verified students only)' })
  create(
    @Param('collegeId') collegeId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviews.create(userId, collegeId, dto);
  }

  @Public()
  @Get('colleges/:collegeId/reviews')
  @ApiOperation({ summary: 'List college reviews (filter by category, sort)' })
  list(
    @Param('collegeId') collegeId: string,
    @Query() query: ReviewQueryDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.reviews.list(collegeId, query, userId);
  }

  @Public()
  @Get('colleges/:collegeId/reviews/summary')
  @ApiOperation({ summary: 'Rating summary by category' })
  summary(@Param('collegeId') collegeId: string) {
    return this.reviews.summary(collegeId);
  }

  @Post('reviews/:id/vote')
  @ApiOperation({ summary: 'Upvote / downvote a review' })
  vote(@Param('id') id: string, @CurrentUser('sub') userId: string, @Body() dto: VoteReviewDto) {
    return this.reviews.vote(id, userId, dto.value);
  }

  // Trust actions (review approval) are centralized to platform admins only —
  // community heads/moderators can never approve/verify reviews.
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('reviews/:id/verify')
  @ApiOperation({ summary: 'Toggle a review verified flag (platform admin only)' })
  verify(@Param('id') id: string) {
    return this.reviews.toggleVerified(id);
  }

  @Delete('reviews/:id')
  @ApiOperation({ summary: 'Delete a review (author or moderator)' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.reviews.remove(id, user.sub, user.role);
  }
}
