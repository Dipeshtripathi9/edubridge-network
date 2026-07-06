import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CollegesService } from './colleges.service';
import { CollegeQueryDto } from './dto/college-query.dto';
import { Public } from '../common/decorators/public.decorator';

// Public, non-personalized catalog data that changes rarely — let browsers/CDNs
// serve it from cache for a minute and revalidate in the background, so repeat
// views are instant and the backend does less work.
const CATALOG_CACHE = 'public, max-age=60, stale-while-revalidate=300';

@ApiTags('colleges')
@Controller('colleges')
export class CollegesController {
  constructor(private readonly colleges: CollegesService) {}

  @Public()
  @Get()
  @Header('Cache-Control', CATALOG_CACHE)
  @ApiOperation({ summary: 'List / search colleges' })
  list(@Query() query: CollegeQueryDto) {
    return this.colleges.list(query);
  }

  @Public()
  @Get(':slug')
  @Header('Cache-Control', CATALOG_CACHE)
  @ApiOperation({ summary: 'Get a college by slug' })
  get(@Param('slug') slug: string) {
    return this.colleges.getBySlug(slug);
  }

  @Public()
  @Get(':slug/hub')
  @Header('Cache-Control', CATALOG_CACHE)
  @ApiOperation({ summary: 'College Community Hub overview (header + counts)' })
  hub(@Param('slug') slug: string) {
    return this.colleges.getCommunityHub(slug);
  }
}
