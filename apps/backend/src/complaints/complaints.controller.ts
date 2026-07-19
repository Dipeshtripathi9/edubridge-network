import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/complaint.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('complaints')
@ApiBearerAuth()
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaints: ComplaintsService) {}

  @Post()
  @ApiOperation({ summary: 'Raise a complaint/issue directly to platform admins' })
  submit(@CurrentUser('sub') userId: string, @Body() dto: CreateComplaintDto) {
    return this.complaints.submit(userId, dto.body);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get()
  @ApiOperation({ summary: 'Complaint queue (admin)' })
  list(@Query() query: PaginationDto) {
    return this.complaints.list(query);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post(':id/resolve')
  @ApiOperation({ summary: 'Resolve a complaint (admin)' })
  resolve(@CurrentUser('sub') adminId: string, @Param('id') id: string) {
    return this.complaints.resolve(adminId, id);
  }
}
