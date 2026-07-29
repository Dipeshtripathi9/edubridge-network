import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ScholarshipsService } from './scholarships.service';
import { ScholarshipQueryDto } from './dto/scholarship-query.dto';
import { Public } from '../common/decorators/public.decorator';

// Public, non-personalized catalog data that changes rarely — let browsers/CDNs
// serve it from cache for a minute and revalidate in the background.
const CATALOG_CACHE = 'public, max-age=60, stale-while-revalidate=300';

@ApiTags('scholarships')
@Controller('scholarships')
export class ScholarshipsController {
  constructor(private readonly scholarships: ScholarshipsService) {}

  @Public()
  @Get()
  @Header('Cache-Control', CATALOG_CACHE)
  @ApiOperation({ summary: 'List / search scholarships' })
  list(@Query() query: ScholarshipQueryDto) {
    return this.scholarships.list(query);
  }

  // Declared before `:slug` — otherwise Nest would match "/scholarships/categories"
  // to the dynamic slug route first.
  @Public()
  @Get('categories')
  @Header('Cache-Control', CATALOG_CACHE)
  @ApiOperation({ summary: 'Distinct scholarship category tags (for filter chips)' })
  categories() {
    return this.scholarships.listCategories();
  }

  @Public()
  @Get(':slug')
  @Header('Cache-Control', CATALOG_CACHE)
  @ApiOperation({ summary: 'Get a scholarship by slug' })
  get(@Param('slug') slug: string) {
    return this.scholarships.getBySlug(slug);
  }
}
