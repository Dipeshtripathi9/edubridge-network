import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { RentalsService } from './rentals.service';
import { CreateRentalLeadDto } from './dto/rental-lead.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('rentals')
@ApiBearerAuth()
@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentals: RentalsService) {}

  @Public()
  @Post('leads')
  @ApiOperation({ summary: 'Submit an EZ-Rentbuddy lead (seeker or property)' })
  create(@Body() dto: CreateRentalLeadDto) {
    return this.rentals.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('leads')
  @ApiOperation({ summary: 'List rental leads (admin)' })
  list(@Query('kind') kind?: string) {
    return this.rentals.list(kind);
  }
}
