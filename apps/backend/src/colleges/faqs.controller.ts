import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { FaqsService } from './faqs.service';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('faqs')
@ApiBearerAuth()
@Controller()
export class FaqsController {
  constructor(private readonly faqs: FaqsService) {}

  @Public()
  @Get('colleges/:collegeId/faqs')
  @ApiOperation({ summary: 'List a college FAQs' })
  list(@Param('collegeId') collegeId: string) {
    return this.faqs.list(collegeId);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('colleges/:collegeId/faqs')
  @ApiOperation({ summary: 'Add a FAQ (admin)' })
  create(
    @Param('collegeId') collegeId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateFaqDto,
  ) {
    return this.faqs.create(collegeId, userId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch('faqs/:id')
  @ApiOperation({ summary: 'Edit a FAQ (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.faqs.update(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete('faqs/:id')
  @ApiOperation({ summary: 'Delete a FAQ (admin)' })
  remove(@Param('id') id: string) {
    return this.faqs.remove(id);
  }
}
