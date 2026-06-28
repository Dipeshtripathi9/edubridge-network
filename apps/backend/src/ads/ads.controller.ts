import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdsService } from './ads.service';
import { CreateAdCardDto } from './dto/ad-card.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('ads')
@ApiBearerAuth()
@Controller()
export class AdsController {
  constructor(private readonly ads: AdsService) {}

  @Get('communities/:slug/ads')
  @ApiOperation({ summary: 'Active advertisement cards in a community' })
  list(@Param('slug') slug: string) {
    return this.ads.listActive(slug);
  }

  @Get('communities/:slug/ads/quota')
  @ApiOperation({ summary: 'My remaining ad-card quota for this community' })
  quota(
    @Param('slug') slug: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.ads.myQuota(slug, { sub: userId, role });
  }

  @Post('communities/:slug/ads')
  @ApiOperation({ summary: 'Book an advertisement card (head/admin)' })
  create(
    @Param('slug') slug: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: CreateAdCardDto,
  ) {
    return this.ads.create(slug, { sub: userId, role }, dto);
  }

  @Delete('ads/:id')
  @ApiOperation({ summary: 'Remove an advertisement card' })
  remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.ads.remove(id, { sub: userId, role });
  }
}
