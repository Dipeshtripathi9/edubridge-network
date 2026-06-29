import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { MentorsService } from './mentors.service';
import { CreateMentorRequestDto } from './dto/mentor-request.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('mentors')
@ApiBearerAuth()
@Controller('mentors')
export class MentorsController {
  constructor(private readonly mentors: MentorsService) {}

  @Public()
  @Post('requests')
  @ApiOperation({ summary: 'Submit a 1:1 expert guidance (mentor) request' })
  create(@Body() dto: CreateMentorRequestDto) {
    return this.mentors.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('requests')
  @ApiOperation({ summary: 'List mentor requests (admin)' })
  list() {
    return this.mentors.list();
  }
}
