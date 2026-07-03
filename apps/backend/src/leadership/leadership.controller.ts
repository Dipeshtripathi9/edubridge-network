import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { LeadershipService } from './leadership.service';
import { CreateSupportRequestDto } from './dto/support.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('leadership')
@ApiBearerAuth()
@Controller('leadership')
export class LeadershipController {
  constructor(private readonly leadership: LeadershipService) {}

  @Post('support')
  @ApiOperation({ summary: 'Community manager contacts the admin team (referral / mentorship / question)' })
  createSupport(@CurrentUser('sub') userId: string, @Body() dto: CreateSupportRequestDto) {
    return this.leadership.createSupport(userId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('support')
  @ApiOperation({ summary: 'List community-manager support requests (admin)' })
  listSupport() {
    return this.leadership.listSupport();
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('support/:id/resolve')
  @ApiOperation({ summary: 'Mark a manager support request resolved (admin)' })
  resolveSupport(@Param('id') id: string) {
    return this.leadership.resolveSupport(id);
  }
}
