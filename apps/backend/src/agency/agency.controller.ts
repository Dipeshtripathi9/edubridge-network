import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AgencyService } from './agency.service';
import { CreateAgencyLeadDto } from './dto/agency-lead.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('agency')
@ApiBearerAuth()
@Controller('agency')
export class AgencyController {
  constructor(private readonly agency: AgencyService) {}

  @Public()
  @Post('leads')
  @ApiOperation({ summary: 'Submit a 99x Developers lead (proposal/career/influencer)' })
  create(@Body() dto: CreateAgencyLeadDto) {
    return this.agency.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('leads')
  @ApiOperation({ summary: 'List agency leads (admin)' })
  list(@Query('kind') kind?: string) {
    return this.agency.list(kind);
  }
}
