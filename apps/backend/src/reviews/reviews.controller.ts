import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, ReviewQueryDto, VoteReviewDto } from './dto/review.dto';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

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

  @Delete('reviews/:id')
  @ApiOperation({ summary: 'Delete a review (author or moderator)' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.reviews.remove(id, user.sub, user.role);
  }
}
