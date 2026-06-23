import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PoolsService } from './pools.service';
import { CreatePoolDto } from './dto/pool.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('pools')
@ApiBearerAuth()
@Controller()
export class PoolsController {
  constructor(private readonly pools: PoolsService) {}

  @Get('communities/:slug/pools')
  @ApiOperation({ summary: 'List private pools in a community' })
  list(@Param('slug') slug: string, @CurrentUser('sub') userId: string) {
    return this.pools.list(slug, userId);
  }

  @Post('communities/:slug/pools')
  @ApiOperation({ summary: 'Create a private capped pool (group chat)' })
  create(
    @Param('slug') slug: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreatePoolDto,
  ) {
    return this.pools.create(userId, slug, dto);
  }

  @Get('pools/me')
  @ApiOperation({ summary: 'Pools I belong to (my network)' })
  mine(@CurrentUser('sub') userId: string) {
    return this.pools.myPools(userId);
  }

  @Get('pools/:id')
  @ApiOperation({ summary: 'Pool detail (members, capacity, chat id)' })
  get(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.pools.get(id, userId);
  }

  @Post('pools/:id/join')
  @ApiOperation({ summary: 'Join a pool (fails if full)' })
  join(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.pools.join(id, userId);
  }

  @Post('pools/:id/like')
  @ApiOperation({ summary: 'Toggle like on a pool' })
  like(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.pools.toggleLike(id, userId);
  }

  @Post('pools/:id/share')
  @ApiOperation({ summary: 'Increment the pool share counter' })
  share(@Param('id') id: string) {
    return this.pools.share(id);
  }

  @Delete('pools/:id/leave')
  @ApiOperation({ summary: 'Leave a pool' })
  leave(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.pools.leave(id, userId);
  }
}
