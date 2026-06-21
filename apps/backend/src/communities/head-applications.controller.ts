import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CommunitiesService } from './communities.service';
import { HeadDecisionDto } from './dto/moderation.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('head-applications')
@ApiBearerAuth()
@Controller('head-applications')
export class HeadApplicationsController {
  constructor(private readonly communities: CommunitiesService) {}

  @Get('me')
  @ApiOperation({ summary: 'My community-head applications' })
  mine(@CurrentUser('sub') userId: string) {
    return this.communities.myHeadApplications(userId);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get()
  @ApiOperation({ summary: 'Pending head-application queue (admin)' })
  queue(@Query() query: PaginationDto) {
    return this.communities.listHeadApplications(query);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a head application → assigns the role (admin)' })
  approve(@CurrentUser('sub') adminId: string, @Param('id') id: string) {
    return this.communities.decideHeadApplication(adminId, id, true);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a head application (admin)' })
  reject(
    @CurrentUser('sub') adminId: string,
    @Param('id') id: string,
    @Body() dto: HeadDecisionDto,
  ) {
    return this.communities.decideHeadApplication(adminId, id, false, dto.note);
  }
}
