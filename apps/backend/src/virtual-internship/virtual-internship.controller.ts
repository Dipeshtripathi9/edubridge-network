import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { VirtualInternshipService } from './virtual-internship.service';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('virtual-internship')
@ApiBearerAuth()
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('virtual-internship')
export class VirtualInternshipController {
  constructor(private readonly virtualInternship: VirtualInternshipService) {}

  @Get('enrollments')
  @ApiOperation({ summary: 'List all virtual internship enrollments, with their tasks (platform admin only)' })
  listEnrollments() {
    return this.virtualInternship.listEnrollments();
  }

  @Get('scholarships')
  @ApiOperation({ summary: 'List per-track scholarship capacity rows (platform admin only)' })
  listScholarships() {
    return this.virtualInternship.listScholarships();
  }
}
