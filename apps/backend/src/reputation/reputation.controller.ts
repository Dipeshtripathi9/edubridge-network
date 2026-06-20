import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReputationService } from './reputation.service';
import { LeaderboardQueryDto } from './dto/reputation-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('reputation')
@ApiBearerAuth()
@Controller('reputation')
export class ReputationController {
  constructor(private readonly reputation: ReputationService) {}

  @Public()
  @Get('leaderboard')
  @ApiOperation({ summary: 'Top contributors (optionally by college)' })
  leaderboard(@Query() query: LeaderboardQueryDto) {
    return this.reputation.leaderboard(query);
  }

  @Public()
  @Get('badges')
  @ApiOperation({ summary: 'All available badges' })
  badges() {
    return this.reputation.listBadges();
  }

  @Get('me')
  @ApiOperation({ summary: 'My reputation, badges and recent events' })
  me(@CurrentUser('sub') userId: string) {
    return this.reputation.getUserReputation(userId);
  }

  @Public()
  @Get('users/:userId')
  @ApiOperation({ summary: 'A user reputation and badges' })
  user(@Param('userId') userId: string) {
    return this.reputation.getUserReputation(userId);
  }
}
