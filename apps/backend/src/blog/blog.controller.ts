import { Controller, Get, Header, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { BlogService } from './blog.service';
import { BlogQueryDto } from './dto/blog.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

const CATALOG_CACHE = 'public, max-age=60, stale-while-revalidate=300';

@ApiTags('blog')
@ApiBearerAuth()
@Controller('blog')
export class BlogController {
  constructor(private readonly blog: BlogService) {}

  @Public()
  @Get()
  @Header('Cache-Control', CATALOG_CACHE)
  @ApiOperation({ summary: 'List published blog posts' })
  list(@Query() query: BlogQueryDto) {
    return this.blog.list(query);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a pending blog post (platform admin only)' })
  publish(@Param('id') id: string) {
    return this.blog.publish(id);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a pending blog post (platform admin only)' })
  reject(@Param('id') id: string) {
    return this.blog.reject(id);
  }

  @Public()
  @Get(':slug')
  @Header('Cache-Control', CATALOG_CACHE)
  @ApiOperation({ summary: 'Get a published blog post by slug' })
  get(@Param('slug') slug: string) {
    return this.blog.getBySlug(slug);
  }
}
