import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { CreateReferralDto } from './dto/referral.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('referrals')
@ApiBearerAuth()
@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referrals: ReferralsService) {}

  @Get()
  @ApiOperation({ summary: 'Career referrals (leaders & admins)' })
  list(@CurrentUser('sub') userId: string, @CurrentUser('role') role: string) {
    return this.referrals.list({ sub: userId, role });
  }

  @Post()
  @ApiOperation({ summary: 'Post a referral (admin)' })
  create(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: CreateReferralDto,
  ) {
    return this.referrals.create({ sub: userId, role }, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a referral (admin)' })
  remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.referrals.remove(id, { sub: userId, role });
  }
}
