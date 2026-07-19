import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AdminService } from './admin.service';
import {
  AdminUserQueryDto,
  AuditQueryDto,
  ModerateContentDto,
  ReportQueryDto,
  ResolveReportDto,
  SetUserRoleDto,
  SetUserStatusDto,
  VerifyCollegeDto,
} from './dto/admin.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('analytics')
  @ApiOperation({ summary: 'Dashboard metrics (DAU/MAU, content, top lists)' })
  analytics() {
    return this.admin.analytics();
  }

  // ---- Users ----
  @Get('users')
  @ApiOperation({ summary: 'List / search users' })
  users(@Query() query: AdminUserQueryDto) {
    return this.admin.listUsers(query);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Suspend / ban / reactivate a user' })
  setStatus(
    @CurrentUser('sub') adminId: string,
    @Param('id') id: string,
    @Body() dto: SetUserStatusDto,
  ) {
    return this.admin.setUserStatus(adminId, id, dto);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Change a user role' })
  setRole(@CurrentUser('sub') adminId: string, @Param('id') id: string, @Body() dto: SetUserRoleDto) {
    return this.admin.setUserRole(adminId, id, dto);
  }

  @Patch('users/:id/verify-college')
  @ApiOperation({ summary: 'Verify / reject a student college claim' })
  verifyCollege(
    @CurrentUser('sub') adminId: string,
    @Param('id') id: string,
    @Body() dto: VerifyCollegeDto,
  ) {
    return this.admin.verifyCollege(adminId, id, dto);
  }

  // ---- Reports ----
  @Get('reports')
  @ApiOperation({ summary: 'Moderation report queue' })
  reports(@Query() query: ReportQueryDto) {
    return this.admin.listReports(query);
  }

  @Post('reports/:id/resolve')
  @ApiOperation({ summary: 'Resolve / dismiss a report' })
  resolve(
    @CurrentUser('sub') adminId: string,
    @Param('id') id: string,
    @Body() dto: ResolveReportDto,
  ) {
    return this.admin.resolveReport(adminId, id, dto);
  }

  // ---- Content moderation ----
  @Delete('content')
  @ApiOperation({ summary: 'Remove a review / resource' })
  moderate(@CurrentUser('sub') adminId: string, @Body() dto: ModerateContentDto) {
    return this.admin.moderateContent(adminId, dto);
  }

  // ---- Audit ----
  @Get('audit-logs')
  @ApiOperation({ summary: 'Audit log' })
  auditLogs(@Query() query: AuditQueryDto) {
    return this.admin.listAuditLogs(query);
  }

  @Get('email-logs')
  @ApiOperation({ summary: 'Email delivery audit (Email Management)' })
  emailLogs(@Query() query: AuditQueryDto) {
    return this.admin.listEmailLogs(query);
  }
}
