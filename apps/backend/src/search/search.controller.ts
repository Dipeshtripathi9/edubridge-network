import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Global search (grouped, or paginated when type is set)' })
  query(@Query() query: SearchQueryDto) {
    return this.search.search(query);
  }

  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('reindex')
  @ApiOperation({ summary: 'Rebuild the Elasticsearch index from the database (admin)' })
  reindex() {
    return this.search.reindexAll();
  }
}
