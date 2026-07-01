import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';
import {
  CreateResourceDto,
  RateResourceDto,
  ResourceCommentDto,
  ResourceQueryDto,
  UploadUrlDto,
} from './dto/resource.dto';
import { UserRole } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('resources')
@ApiBearerAuth()
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resources: ResourcesService) {}

  @Post('upload-url')
  @ApiOperation({ summary: 'Get a presigned S3 upload URL' })
  uploadUrl(@Body() dto: UploadUrlDto) {
    return this.resources.getUploadUrl(dto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a resource (after upload)' })
  create(@CurrentUser('sub') userId: string, @CurrentUser('role') role: string, @Body() dto: CreateResourceDto) {
    return this.resources.create(userId, dto, role);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List / search resources' })
  list(@Query() query: ResourceQueryDto, @CurrentUser('sub') userId?: string) {
    return this.resources.list(query, userId);
  }

  @Get('bookmarks/me')
  @ApiOperation({ summary: 'My bookmarked resources' })
  myBookmarks(@CurrentUser('sub') userId: string) {
    return this.resources.myBookmarks(userId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a resource' })
  getOne(@Param('id') id: string, @CurrentUser('sub') userId?: string) {
    return this.resources.getOne(id, userId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Record a download and get a signed URL' })
  download(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.resources.download(id, userId);
  }

  @Post(':id/rate')
  @ApiOperation({ summary: 'Rate a resource (1-5)' })
  rate(@Param('id') id: string, @CurrentUser('sub') userId: string, @Body() dto: RateResourceDto) {
    return this.resources.rate(id, userId, dto);
  }

  @Post(':id/bookmark')
  @ApiOperation({ summary: 'Toggle bookmark on a resource' })
  bookmark(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.resources.toggleBookmark(id, userId);
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Toggle like on a resource' })
  like(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.resources.toggleLike(id, userId);
  }

  @Public()
  @Get(':id/comments')
  @ApiOperation({ summary: 'List comments on a resource' })
  comments(@Param('id') id: string, @Query() query: PaginationDto) {
    return this.resources.listComments(id, query);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Comment on a resource' })
  addComment(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: ResourceCommentDto,
  ) {
    return this.resources.addComment(id, userId, dto.body);
  }

  @Public()
  @Post(':id/share')
  @ApiOperation({ summary: 'Increment the share counter' })
  share(@Param('id') id: string) {
    return this.resources.share(id);
  }

  @Roles(UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post(':id/feature')
  @ApiOperation({ summary: 'Feature / unfeature a resource (moderator/admin)' })
  feature(@Param('id') id: string) {
    return this.resources.toggleFeature(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a resource (uploader or moderator)' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.resources.remove(id, user.sub, user.role);
  }
}
