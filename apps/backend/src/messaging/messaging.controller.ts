import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { MessagingGateway } from './messaging.gateway';
import { CreateDirectChatDto, MessageQueryDto, SendMessageDto } from './dto/messaging.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('messaging')
@ApiBearerAuth()
@Controller('chats')
export class MessagingController {
  constructor(
    private readonly messaging: MessagingService,
    private readonly gateway: MessagingGateway,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List my chats with last message + unread counts' })
  myChats(@CurrentUser('sub') userId: string) {
    return this.messaging.listMyChats(userId);
  }

  @Post('direct')
  @ApiOperation({ summary: 'Get or create a direct chat with another user' })
  direct(@CurrentUser('sub') userId: string, @Body() dto: CreateDirectChatDto) {
    return this.messaging.getOrCreateDirectChat(userId, dto.userId);
  }

  @Post('community/:communityId')
  @ApiOperation({ summary: 'Get or create a community chat (members only)' })
  community(@CurrentUser('sub') userId: string, @Param('communityId') communityId: string) {
    return this.messaging.getOrCreateCommunityChat(communityId, userId);
  }

  @Get(':chatId/messages')
  @ApiOperation({ summary: 'Message history (cursor paginated)' })
  messages(
    @Param('chatId') chatId: string,
    @CurrentUser('sub') userId: string,
    @Query() query: MessageQueryDto,
  ) {
    return this.messaging.getMessages(chatId, userId, query);
  }

  @Post(':chatId/messages')
  @ApiOperation({ summary: 'Send a message (REST fallback; also broadcasts over WS)' })
  async send(
    @Param('chatId') chatId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    const message = await this.messaging.sendMessage(chatId, userId, dto);
    await this.gateway.broadcastMessage(chatId, message, userId);
    return message;
  }

  @Post(':chatId/read')
  @ApiOperation({ summary: 'Mark a chat as read' })
  read(@Param('chatId') chatId: string, @CurrentUser('sub') userId: string) {
    return this.messaging.markRead(chatId, userId);
  }
}
