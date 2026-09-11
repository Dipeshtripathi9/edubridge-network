import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CampusAmbassadorService } from './campus-ambassador.service';
import {
  ApplyCampusAmbassadorDto,
  CampusAmbassadorApplicationQueryDto,
  DecideCampusAmbassadorDto,
  SetCampusAmbassadorSettingsDto,
} from './dto/campus-ambassador.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('campus-ambassador')
@ApiBearerAuth()
@Controller('campus-ambassador')
export class CampusAmbassadorController {
  constructor(private readonly campusAmbassador: CampusAmbassadorService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Whether applications are currently open' })
  settings() {
    return this.campusAmbassador.isOpen().then((applicationsOpen) => ({ applicationsOpen }));
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply to become a campus ambassador' })
  apply(@CurrentUser('sub') userId: string, @Body() dto: ApplyCampusAmbassadorDto) {
    return this.campusAmbassador.apply(userId, dto.reason);
  }

  @Get('me')
  @ApiOperation({ summary: 'My own application, if any' })
  myApplication(@CurrentUser('sub') userId: string) {
    return this.campusAmbassador.myApplication(userId);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('settings')
  @ApiOperation({ summary: 'Open/close new applications (admin)' })
  setSettings(@Body() dto: SetCampusAmbassadorSettingsDto) {
    return this.campusAmbassador.setOpen(dto.applicationsOpen);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('applications')
  @ApiOperation({ summary: 'List applications, optionally filtered by status (admin)' })
  listApplications(@Query() query: CampusAmbassadorApplicationQueryDto) {
    return this.campusAmbassador.listApplications(query);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('applications/:id/decide')
  @ApiOperation({ summary: 'Approve or reject an application (admin)' })
  decide(@Param('id') id: string, @Body() dto: DecideCampusAmbassadorDto) {
    return this.campusAmbassador.decide(id, dto.approve);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('ambassadors')
  @ApiOperation({ summary: 'Approved ambassadors — contact no, gmail, state (admin)' })
  ambassadors() {
    return this.campusAmbassador.listAmbassadors();
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('referrals')
  @ApiOperation({ summary: 'Referral counts per approved ambassador (admin)' })
  referrals() {
    return this.campusAmbassador.referralCounts();
  }
}
