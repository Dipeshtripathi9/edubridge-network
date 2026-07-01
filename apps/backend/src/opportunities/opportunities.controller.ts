import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OpportunitiesService } from './opportunities.service';
import {
  ApplicationDto,
  CreateOpportunityDto,
  OpportunityQueryDto,
  UpdateOpportunityDto,
} from './dto/opportunity.dto';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('opportunities')
@ApiBearerAuth()
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunities: OpportunitiesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List / search opportunities' })
  list(@Query() query: OpportunityQueryDto, @CurrentUser('sub') userId?: string) {
    return this.opportunities.list(query, userId);
  }

  @Get('recommended')
  @ApiOperation({ summary: 'Personalized recommendations (interest-based)' })
  recommended(@CurrentUser('sub') userId: string) {
    return this.opportunities.recommend(userId);
  }

  @Get('applications/me')
  @ApiOperation({ summary: 'My saved / applied opportunities' })
  myApplications(@CurrentUser('sub') userId: string) {
    return this.opportunities.myApplications(userId);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Pending opportunities awaiting approval (admin or community manager)' })
  pending(@CurrentUser() actor: JwtUser, @Query('communityId') communityId?: string) {
    return this.opportunities.listPending(actor, communityId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get an opportunity' })
  getOne(@Param('id') id: string, @CurrentUser('sub') userId?: string) {
    return this.opportunities.getOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Post / submit an opportunity (community submissions need approval)' })
  create(@CurrentUser() actor: JwtUser, @Body() dto: CreateOpportunityDto) {
    return this.opportunities.create(actor, dto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a pending opportunity (admin or community manager)' })
  approve(@Param('id') id: string, @CurrentUser() actor: JwtUser) {
    return this.opportunities.decide(actor, id, true);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a pending opportunity (admin or community manager)' })
  reject(@Param('id') id: string, @CurrentUser() actor: JwtUser) {
    return this.opportunities.decide(actor, id, false);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an opportunity (owner or admin)' })
  update(@Param('id') id: string, @CurrentUser() user: JwtUser, @Body() dto: UpdateOpportunityDto) {
    return this.opportunities.update(id, user.sub, user.role, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate an opportunity (owner or admin)' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.opportunities.remove(id, user.sub, user.role);
  }

  @Post(':id/application')
  @ApiOperation({ summary: 'Save / apply / update application status' })
  apply(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: ApplicationDto,
  ) {
    return this.opportunities.upsertApplication(id, userId, dto);
  }

  @Delete('applications/:applicationId')
  @ApiOperation({ summary: 'Remove a saved/applied application' })
  removeApplication(
    @Param('applicationId') applicationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.opportunities.removeApplication(applicationId, userId);
  }
}
