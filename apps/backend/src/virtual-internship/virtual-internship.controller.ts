import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { VirtualInternshipService } from './virtual-internship.service';
import {
  ConfirmPaymentDto,
  EnrollVirtualInternshipDto,
  SubmitPaymentReferenceDto,
  VirtualInternshipQueryDto,
} from './dto/virtual-internship.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('virtual-internship')
@ApiBearerAuth()
@Controller('virtual-internship')
export class VirtualInternshipController {
  constructor(private readonly virtualInternship: VirtualInternshipService) {}

  // ---- Student ----

  @Post('enroll')
  @ApiOperation({ summary: 'Enroll in the Virtual Internship' })
  enroll(@CurrentUser('sub') userId: string, @Body() dto: EnrollVirtualInternshipDto) {
    return this.virtualInternship.enroll(userId, dto);
  }

  @Get('enrollments/me')
  @ApiOperation({ summary: 'My latest Virtual Internship enrollment' })
  myEnrollment(@CurrentUser('sub') userId: string) {
    return this.virtualInternship.myEnrollment(userId);
  }

  @Patch('enrollments/:id/payment-reference')
  @ApiOperation({ summary: 'Submit / update the manual-payment reference note' })
  submitPaymentReference(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: SubmitPaymentReferenceDto,
  ) {
    return this.virtualInternship.submitPaymentReference(userId, id, dto);
  }

  // ---- Admin ----

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('enrollments')
  @ApiOperation({ summary: 'List Virtual Internship enrollments (admin)' })
  listEnrollments(@Query() query: VirtualInternshipQueryDto) {
    return this.virtualInternship.listEnrollments(query);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('enrollments/:id/confirm-payment')
  @ApiOperation({ summary: 'Confirm the manually-verified payment (admin)' })
  confirmPayment(
    @CurrentUser('sub') adminId: string,
    @Param('id') id: string,
    @Body() dto: ConfirmPaymentDto,
  ) {
    return this.virtualInternship.confirmPayment(adminId, id, dto);
  }
}
