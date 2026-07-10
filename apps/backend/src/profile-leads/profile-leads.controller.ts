import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ProfileLeadsService } from './profile-leads.service';
import {
  DeleteProfileLeadDto,
  ProfileLeadNoteDto,
  UpsertProfileStepDto,
} from './dto/profile-lead.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('profile-leads')
@ApiBearerAuth()
@Controller('profile-leads')
export class ProfileLeadsController {
  constructor(private readonly leads: ProfileLeadsService) {}

  @Post('step')
  @ApiOperation({ summary: 'Save one step of my EduBridge Profile (upsert)' })
  upsertStep(@CurrentUser('sub') userId: string, @Body() dto: UpsertProfileStepDto) {
    return this.leads.upsertStep(userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'My EduBridge Profile lead (for progress + prefill)' })
  myLead(@CurrentUser('sub') userId: string) {
    return this.leads.myLead(userId);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get()
  @ApiOperation({ summary: 'List student profile leads (admin)' })
  list() {
    return this.leads.list();
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':id/note')
  @ApiOperation({ summary: 'Set the counselor note on a profile lead (admin)' })
  setNote(@Param('id') id: string, @Body() dto: ProfileLeadNoteDto) {
    return this.leads.setNote(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a profile lead with a reason (admin)' })
  remove(
    @CurrentUser('sub') adminId: string,
    @Param('id') id: string,
    @Body() dto: DeleteProfileLeadDto,
  ) {
    return this.leads.remove(id, adminId, dto);
  }
}
