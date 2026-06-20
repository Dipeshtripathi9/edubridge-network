import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateReportDto } from './dto/admin.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly admin: AdminService) {}

  @Post()
  @ApiOperation({ summary: 'Report content or a user' })
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateReportDto) {
    return this.admin.createReport(userId, dto);
  }
}
