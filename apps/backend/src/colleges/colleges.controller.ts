import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CollegesService } from './colleges.service';
import { CollegeQueryDto } from './dto/college-query.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('colleges')
@Controller('colleges')
export class CollegesController {
  constructor(private readonly colleges: CollegesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List / search colleges' })
  list(@Query() query: CollegeQueryDto) {
    return this.colleges.list(query);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a college by slug' })
  get(@Param('slug') slug: string) {
    return this.colleges.getBySlug(slug);
  }

  @Public()
  @Get(':slug/hub')
  @ApiOperation({ summary: 'College Community Hub overview (header + counts)' })
  hub(@Param('slug') slug: string) {
    return this.colleges.getCommunityHub(slug);
  }
}
