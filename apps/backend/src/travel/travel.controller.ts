import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TravelService } from './travel.service';
import { CreateTravelPoolDto } from './dto/travel-pool.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('travel')
@ApiBearerAuth()
@Controller('travel-pools')
export class TravelController {
  constructor(private readonly travel: TravelService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Active travel/ride pools (kind=TRIP|RIDE)' })
  list(@Query('kind') kind?: string, @CurrentUser('sub') userId?: string) {
    return this.travel.list(kind, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a travel/ride pool (verified student)' })
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateTravelPoolDto) {
    return this.travel.create(userId, dto);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a pool (verified student)' })
  join(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.travel.join(id, userId);
  }
}
