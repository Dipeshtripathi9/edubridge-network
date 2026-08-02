import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CollegesService } from './colleges.service';
import { CollegeQueryDto } from './dto/college-query.dto';
import { CreateCollegeDto, UpdateCollegeDto } from './dto/college.dto';
import { CreateCollegeCourseDto, UpdateCollegeCourseDto } from './dto/college-course.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

// Public, non-personalized catalog data that changes rarely — let browsers/CDNs
// serve it from cache for a minute and revalidate in the background, so repeat
// views are instant and the backend does less work.
const CATALOG_CACHE = 'public, max-age=60, stale-while-revalidate=300';

@ApiTags('colleges')
@ApiBearerAuth()
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

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a college (platform admin only)' })
  create(@Body() dto: CreateCollegeDto) {
    return this.colleges.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a college (platform admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateCollegeDto) {
    return this.colleges.update(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a college (platform admin only)' })
  remove(@Param('id') id: string) {
    return this.colleges.remove(id);
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

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post(':collegeId/courses')
  @ApiOperation({ summary: 'Add a course path to a college (platform admin only)' })
  addCourse(@Param('collegeId') collegeId: string, @Body() dto: CreateCollegeCourseDto) {
    return this.colleges.addCourse(collegeId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':collegeId/courses/:courseId')
  @ApiOperation({ summary: 'Update a college course path (platform admin only)' })
  updateCourse(
    @Param('collegeId') collegeId: string,
    @Param('courseId') courseId: string,
    @Body() dto: UpdateCollegeCourseDto,
  ) {
    return this.colleges.updateCourse(collegeId, courseId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':collegeId/courses/:courseId')
  @ApiOperation({ summary: 'Delete a college course path (platform admin only)' })
  removeCourse(@Param('collegeId') collegeId: string, @Param('courseId') courseId: string) {
    return this.colleges.removeCourse(collegeId, courseId);
  }
}
