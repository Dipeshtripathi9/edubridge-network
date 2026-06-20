import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { NotificationsService } from './notifications.service';
import { BroadcastDto, NotificationQueryDto } from './dto/notification.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List my notifications' })
  list(@CurrentUser('sub') userId: string, @Query() query: NotificationQueryDto) {
    return this.notifications.list(userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'My unread notification count' })
  unreadCount(@CurrentUser('sub') userId: string) {
    return this.notifications.unreadCount(userId);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark one as read' })
  markRead(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.notifications.markRead(id, userId);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all as read' })
  markAllRead(@CurrentUser('sub') userId: string) {
    return this.notifications.markAllRead(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.notifications.remove(id, userId);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('broadcast')
  @ApiOperation({ summary: 'Broadcast a notification to all users (admin)' })
  broadcast(@Body() dto: BroadcastDto) {
    return this.notifications.broadcast(dto);
  }
}
