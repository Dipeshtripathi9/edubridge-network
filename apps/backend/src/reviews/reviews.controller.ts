import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ReviewsService } from './reviews.service';
import {
  CreateCommunityReviewDto,
  CreateReviewDto,
  ReviewQueryDto,
  VoteReviewDto,
} from './dto/review.dto';
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

  @Post('communities/:slug/reviews')
  @ApiOperation({ summary: 'Review a community’s managers (members only)' })
  createCommunityReview(
    @Param('slug') slug: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCommunityReviewDto,
  ) {
    return this.reviews.createCommunityReview(userId, slug, dto);
  }

  @Public()
  @Get('communities/:slug/reviews')
  @ApiOperation({ summary: 'List a community’s manager reviews' })
  listCommunityReviews(
    @Param('slug') slug: string,
    @Query() query: ReviewQueryDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.reviews.listCommunityReviews(slug, query, userId);
  }

  @Public()
  @Get('communities/:slug/reviews/summary')
  @ApiOperation({ summary: 'Community manager rating summary' })
  communitySummary(@Param('slug') slug: string) {
    return this.reviews.communitySummary(slug);
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
