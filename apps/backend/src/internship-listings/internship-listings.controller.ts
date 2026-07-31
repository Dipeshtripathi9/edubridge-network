import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { InternshipListingsService } from './internship-listings.service';
import {
  CreateInternshipListingDto,
  InternshipListingQueryDto,
  UpdateInternshipListingDto,
} from './dto/internship-listing.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

const CATALOG_CACHE = 'public, max-age=60, stale-while-revalidate=300';

@ApiTags('internship-listings')
@ApiBearerAuth()
@Controller('internship-listings')
export class InternshipListingsController {
  constructor(private readonly listings: InternshipListingsService) {}

  @Public()
  @Get()
  @Header('Cache-Control', CATALOG_CACHE)
  @ApiOperation({ summary: 'List / search internship listings' })
  list(@Query() query: InternshipListingQueryDto) {
    return this.listings.list(query);
  }

  // Declared before `:slug` — otherwise Nest would match "/internship-listings/categories"
  // to the dynamic slug route first.
  @Public()
  @Get('categories')
  @Header('Cache-Control', CATALOG_CACHE)
  @ApiOperation({ summary: 'Distinct internship category tags (for filter chips)' })
  categories() {
    return this.listings.listCategories();
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create an internship listing (platform admin only)' })
  create(@Body() dto: CreateInternshipListingDto) {
    return this.listings.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an internship listing (platform admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateInternshipListingDto) {
    return this.listings.update(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an internship listing (platform admin only)' })
  remove(@Param('id') id: string) {
    return this.listings.remove(id);
  }

  @Public()
  @Get(':slug')
  @Header('Cache-Control', CATALOG_CACHE)
  @ApiOperation({ summary: 'Get an internship listing by slug' })
  get(@Param('slug') slug: string) {
    return this.listings.getBySlug(slug);
  }
}
