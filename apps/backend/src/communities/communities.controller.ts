import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { CommunityQueryDto } from './dto/query.dto';
import {
  AppointHeadDto,
  ApplyHeadDto,
  HelpRequestDto,
  ModerateMemberDto,
  ResolveCommunityReportDto,
  SetMemberRoleDto,
} from './dto/moderation.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserRole } from '@prisma/client';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('communities')
@ApiBearerAuth()
@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communities: CommunitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a community' })
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateCommunityDto) {
    return this.communities.createCommunity(userId, dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List / search communities (paginated)' })
  list(@Query() query: CommunityQueryDto, @CurrentUser('sub') userId?: string) {
    return this.communities.listCommunities(query, userId);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a community by slug' })
  get(@Param('slug') slug: string, @CurrentUser('sub') userId?: string) {
    return this.communities.getCommunityBySlug(slug, userId);
  }

  @Post(':slug/join')
  @ApiOperation({ summary: 'Join a community' })
  join(@CurrentUser('sub') userId: string, @Param('slug') slug: string) {
    return this.communities.joinCommunity(userId, slug);
  }

  @Delete(':slug/leave')
  @ApiOperation({ summary: 'Leave a community' })
  leave(@CurrentUser('sub') userId: string, @Param('slug') slug: string) {
    return this.communities.leaveCommunity(userId, slug);
  }

  @Public()
  @Get(':slug/members')
  @ApiOperation({ summary: 'List community members' })
  members(@Param('slug') slug: string, @Query() query: CommunityQueryDto) {
    return this.communities.listMembers(slug, query);
  }

  @Patch(':slug/members/:userId/role')
  @ApiOperation({ summary: 'Set a member role (community admin / global admin)' })
  setRole(
    @Param('slug') slug: string,
    @Param('userId') userId: string,
    @CurrentUser() actor: JwtUser,
    @Body() dto: SetMemberRoleDto,
  ) {
    return this.communities.setMemberRole(slug, actor, userId, dto.role);
  }

  @Post(':slug/members/:userId/moderate')
  @ApiOperation({ summary: 'Mute / unmute / ban / unban a member (community mod/admin)' })
  moderate(
    @Param('slug') slug: string,
    @Param('userId') userId: string,
    @CurrentUser() actor: JwtUser,
    @Body() dto: ModerateMemberDto,
  ) {
    return this.communities.moderateMember(slug, actor, userId, dto.action, dto.minutes);
  }

  @Post(':slug/head-applications')
  @ApiOperation({ summary: 'Apply to lead a community (verified students)' })
  applyForHead(
    @Param('slug') slug: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: ApplyHeadDto,
  ) {
    return this.communities.applyForHead(userId, slug, dto.requestedRole, dto.pitch);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post(':slug/appoint-head')
  @ApiOperation({ summary: 'Appoint a community head by email (admin)' })
  appointHead(@Param('slug') slug: string, @Body() dto: AppointHeadDto) {
    return this.communities.appointHead(slug, dto.email, dto.role);
  }

  // ---- Head monitoring (community mod/admin or global admin) ----
  @Get(':slug/activity')
  @ApiOperation({ summary: 'Recent community activity (heads/mods)' })
  activity(@Param('slug') slug: string, @CurrentUser() actor: JwtUser, @Query() query: CommunityQueryDto) {
    return this.communities.getActivity(slug, actor, query);
  }

  @Get(':slug/reports')
  @ApiOperation({ summary: 'Open reports for this community (heads/mods)' })
  reports(@Param('slug') slug: string, @CurrentUser() actor: JwtUser, @Query() query: CommunityQueryDto) {
    return this.communities.getReports(slug, actor, query);
  }

  @Post(':slug/reports/:reportId/resolve')
  @ApiOperation({ summary: 'Resolve / dismiss a community report (heads/mods)' })
  resolveReport(
    @Param('slug') slug: string,
    @Param('reportId') reportId: string,
    @CurrentUser() actor: JwtUser,
    @Body() dto: ResolveCommunityReportDto,
  ) {
    return this.communities.resolveReport(slug, actor, reportId, dto.status);
  }

  @Get(':slug/analytics')
  @ApiOperation({ summary: 'Per-community analytics (heads/mods)' })
  analytics(@Param('slug') slug: string, @CurrentUser() actor: JwtUser) {
    return this.communities.getAnalytics(slug, actor);
  }

  // ---- Help requests (startup communities) ----
  @Post(':slug/help')
  @ApiOperation({ summary: 'Raise a help request (members)' })
  submitHelp(
    @Param('slug') slug: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: HelpRequestDto,
  ) {
    return this.communities.submitHelp(userId, slug, dto.body);
  }

  @Get(':slug/help')
  @ApiOperation({ summary: 'List help requests for a community' })
  listHelp(@Param('slug') slug: string, @Query() query: PaginationDto) {
    return this.communities.listHelp(slug, query);
  }

  @Post(':slug/help/:id/resolve')
  @ApiOperation({ summary: 'Resolve a help request (heads/mods)' })
  resolveHelp(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @CurrentUser() actor: JwtUser,
  ) {
    return this.communities.resolveHelp(slug, actor, id);
  }
}
