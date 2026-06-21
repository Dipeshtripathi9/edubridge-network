import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { CommunityQueryDto } from './dto/query.dto';
import { ModerateMemberDto, SetMemberRoleDto } from './dto/moderation.dto';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

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
}
