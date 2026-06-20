import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { TransferService } from './transfer.service';
import { EligibilityCheckDto } from './dto/eligibility.dto';
import {
  CreateTransferDto,
  ShareStoryDto,
  TransferStoryQueryDto,
  UpdateTransferDto,
  UpsertRequirementDto,
} from './dto/transfer.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('transfer')
@ApiBearerAuth()
@Controller('transfer')
export class TransferController {
  constructor(private readonly transfer: TransferService) {}

  @Public()
  @Post('eligibility')
  @ApiOperation({ summary: 'Check transfer eligibility against the College Data layer' })
  checkEligibility(@Body() dto: EligibilityCheckDto) {
    return this.transfer.checkEligibility(dto);
  }

  @Public()
  @Get('colleges/:collegeId/requirements')
  @ApiOperation({ summary: 'List a college transfer requirements' })
  collegeRequirements(@Param('collegeId') collegeId: string) {
    return this.transfer.getCollegeRequirements(collegeId);
  }

  // ---- Journey ----
  @Get('me')
  @ApiOperation({ summary: 'My transfer journeys' })
  myJourneys(@CurrentUser('sub') userId: string) {
    return this.transfer.getMyJourneys(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Start tracking a transfer journey' })
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateTransferDto) {
    return this.transfer.createOrUpdateJourney(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transfer journey' })
  update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTransferDto,
  ) {
    return this.transfer.updateJourney(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transfer journey' })
  remove(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.transfer.deleteJourney(userId, id);
  }

  // ---- Stories ----
  @Post(':id/story')
  @ApiOperation({ summary: 'Share a transfer story from one of your journeys' })
  shareStory(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: ShareStoryDto,
  ) {
    return this.transfer.shareStory(userId, id, dto);
  }

  @Public()
  @Get('stories')
  @ApiOperation({ summary: 'Browse public transfer stories' })
  stories(@Query() query: TransferStoryQueryDto) {
    return this.transfer.listStories(query);
  }

  @Public()
  @Get('stories/:id')
  @ApiOperation({ summary: 'Read a transfer story' })
  story(@Param('id') id: string) {
    return this.transfer.getStory(id);
  }

  // ---- Admin: transfer data management ----
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('requirements')
  @ApiOperation({ summary: 'Create/ingest a transfer requirement (admin)' })
  upsertRequirement(@Body() dto: UpsertRequirementDto) {
    return this.transfer.upsertRequirement(dto);
  }
}
