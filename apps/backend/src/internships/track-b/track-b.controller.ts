import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { TrackBService } from './track-b.service';
import {
  AllocateTrackBDto,
  ApplyTrackBDto,
  PayoutSentDto,
  ReviewTrackBDto,
  SubmitTrackBWorkDto,
  TrackBQueryDto,
} from './dto/track-b.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@ApiTags('internships-track-b')
@ApiBearerAuth()
@Controller('internships')
export class TrackBController {
  constructor(private readonly trackB: TrackBService) {}

  // ---- Student ----

  @Post('apply')
  @ApiOperation({ summary: 'Apply for Track B (free, merit-based)' })
  apply(@CurrentUser('sub') userId: string, @Body() dto: ApplyTrackBDto) {
    return this.trackB.apply(userId, dto);
  }

  @Get('applications/me')
  @ApiOperation({ summary: 'My latest Track B application' })
  myApplication(@CurrentUser('sub') userId: string) {
    return this.trackB.myApplication(userId);
  }

  @Get('applications/:id')
  @ApiOperation({ summary: 'Get a Track B application (owner or admin)' })
  getApplication(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.trackB.getApplication(user.sub, user.role, id);
  }

  @Post('applications/:id/submit')
  @ApiOperation({ summary: 'Submit work for the allocated task' })
  submitWork(@CurrentUser('sub') userId: string, @Param('id') id: string, @Body() dto: SubmitTrackBWorkDto) {
    return this.trackB.submitWork(userId, id, dto);
  }

  // ---- Admin ----

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('applications')
  @ApiOperation({ summary: 'List Track B applications (admin)' })
  listApplications(@Query() query: TrackBQueryDto) {
    return this.trackB.listApplications(query);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('applications/:id/allocate')
  @ApiOperation({ summary: 'Allocate paid work or a skill task (admin)' })
  allocate(@CurrentUser('sub') adminId: string, @Param('id') id: string, @Body() dto: AllocateTrackBDto) {
    return this.trackB.allocate(adminId, id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('applications/:id/review')
  @ApiOperation({ summary: 'Approve / reject a submission, issuing a certificate on approval (admin)' })
  review(@CurrentUser('sub') adminId: string, @Param('id') id: string, @Body() dto: ReviewTrackBDto) {
    return this.trackB.review(adminId, id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('applications/:id/payout-sent')
  @ApiOperation({ summary: 'Mark the payout as sent (PAID_CLIENT_WORK only, admin)' })
  payoutSent(@CurrentUser('sub') adminId: string, @Param('id') id: string, @Body() dto: PayoutSentDto) {
    return this.trackB.payoutSent(adminId, id, dto);
  }
}
