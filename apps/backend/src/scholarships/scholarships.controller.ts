import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ScholarshipsService } from './scholarships.service';
import { ScholarshipQueryDto } from './dto/scholarship-query.dto';
import { CreateScholarshipDto, UpdateScholarshipDto } from './dto/scholarship.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

// Public, non-personalized catalog data that changes rarely — let browsers/CDNs
// serve it from cache for a minute and revalidate in the background.
const CATALOG_CACHE = 'public, max-age=60, stale-while-revalidate=300';

@ApiTags('scholarships')
@ApiBearerAuth()
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

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a scholarship (platform admin only)' })
  create(@Body() dto: CreateScholarshipDto) {
    return this.scholarships.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a scholarship (platform admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateScholarshipDto) {
    return this.scholarships.update(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a scholarship (platform admin only)' })
  remove(@Param('id') id: string) {
    return this.scholarships.remove(id);
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
