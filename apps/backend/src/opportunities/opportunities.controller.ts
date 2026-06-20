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
  list(@Query() query: OpportunityQueryDto) {
    return this.opportunities.list(query);
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

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get an opportunity' })
  getOne(@Param('id') id: string, @CurrentUser('sub') userId?: string) {
    return this.opportunities.getOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Post an opportunity' })
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateOpportunityDto) {
    return this.opportunities.create(userId, dto);
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
