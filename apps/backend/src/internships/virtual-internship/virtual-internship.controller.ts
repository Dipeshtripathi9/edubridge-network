import {
  Body,
  Controller,
  Get,
  Headers,
  ParseIntPipe,
  Post,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { VirtualInternshipService } from './virtual-internship.service';
import { buildInvoicePdf, buildRewardDocumentPdf } from './virtual-internship.pdf';
import {
  AssignVirtualInternshipTaskDto,
  EnrollVirtualInternshipDto,
  ReviewVirtualInternshipTaskDto,
  SubmitVirtualInternshipTaskDto,
  VerifyVirtualInternshipPaymentDto,
  VirtualInternshipAdminQueryDto,
} from './dto/virtual-internship.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('internships-virtual')
@ApiBearerAuth()
@Controller('internships/virtual')
export class VirtualInternshipController {
  constructor(private readonly virtualInternship: VirtualInternshipService) {}

  @Public()
  @Get('pricing')
  @ApiOperation({ summary: 'Public Virtual Internship track pricing' })
  pricing() {
    return this.virtualInternship.pricing();
  }

  @Post('enroll')
  @ApiOperation({ summary: 'Enroll in a Virtual Internship track' })
  enroll(@CurrentUser('sub') userId: string, @Body() dto: EnrollVirtualInternshipDto) {
    return this.virtualInternship.enroll(userId, dto);
  }

  @Get('enrollments/me')
  @ApiOperation({ summary: 'My latest Virtual Internship enrollment' })
  myEnrollment(@CurrentUser('sub') userId: string) {
    return this.virtualInternship.myEnrollment(userId);
  }

  @Post('enrollments/:id/checkout')
  @ApiOperation({ summary: 'Create a Razorpay order to pay the enrollment fee' })
  checkout(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.virtualInternship.checkout(userId, id);
  }

  @Post('enrollments/:id/verify-payment')
  @ApiOperation({ summary: 'Verify a completed Razorpay checkout payment' })
  verifyPayment(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: VerifyVirtualInternshipPaymentDto,
  ) {
    return this.virtualInternship.verifyPayment(userId, id, dto);
  }

  @Public()
  @ApiExcludeEndpoint()
  @Post('webhooks/razorpay')
  razorpayWebhook(@Req() req: RawBodyRequest<Request>, @Headers('x-razorpay-signature') signature?: string) {
    return this.virtualInternship.handleRazorpayWebhook(req.rawBody, signature);
  }

  // ---------------- Tasks (student) ----------------

  @Get('enrollments/me/tasks')
  @ApiOperation({ summary: 'My virtual internship task list, merged with submission/review state' })
  myTasks(@CurrentUser('sub') userId: string) {
    return this.virtualInternship.myTasks(userId);
  }

  @Post('enrollments/me/tasks/:taskIndex/submit')
  @ApiOperation({ summary: 'Submit work for my current unlocked task' })
  submitTask(
    @CurrentUser('sub') userId: string,
    @Param('taskIndex', ParseIntPipe) taskIndex: number,
    @Body() dto: SubmitVirtualInternshipTaskDto,
  ) {
    return this.virtualInternship.submitTask(userId, taskIndex, dto);
  }

  // ---------------- Documents (student) ----------------

  @Get('enrollments/me/invoice')
  @ApiOperation({ summary: 'Download my payment invoice as a PDF (attachment)' })
  async invoice(@CurrentUser('sub') userId: string, @Res() res: Response) {
    const enrollment = await this.virtualInternship.getForInvoice(userId);
    const doc = buildInvoicePdf(enrollment);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${enrollment.id}.pdf"`);
    doc.pipe(res);
    doc.end();
  }

  @Get('enrollments/me/documents/:type/download')
  @ApiOperation({ summary: 'Download my recommendation letter or report card as a PDF (unlocks at 100% progress)' })
  async rewardDocument(
    @CurrentUser('sub') userId: string,
    @Param('type') type: 'letter' | 'report',
    @Res() res: Response,
  ) {
    const { enrollment, tasks } = await this.virtualInternship.getForRewardDocument(userId);
    const doc = buildRewardDocumentPdf(type, enrollment, tasks);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-${enrollment.id}.pdf"`);
    doc.pipe(res);
    doc.end();
  }

  // ---------------- Admin ----------------

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/enrollments')
  @ApiOperation({ summary: 'List virtual internship enrollments (admin)' })
  adminListEnrollments(@Query() query: VirtualInternshipAdminQueryDto) {
    return this.virtualInternship.adminListEnrollments(query);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/enrollments/:id/tasks')
  @ApiOperation({ summary: 'Assign a custom task to a student, beyond the fixed curriculum (admin)' })
  adminAssignTask(
    @CurrentUser('sub') adminId: string,
    @Param('id') id: string,
    @Body() dto: AssignVirtualInternshipTaskDto,
  ) {
    return this.virtualInternship.adminAssignTask(adminId, id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/stats')
  @ApiOperation({ summary: 'Enrollment + review-queue counts (admin)' })
  adminStats() {
    return this.virtualInternship.adminStats();
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('admin/submissions')
  @ApiOperation({ summary: 'Task submissions awaiting review (admin)' })
  adminListSubmissions() {
    return this.virtualInternship.adminListSubmissions();
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/backfill-missing-tasks')
  @ApiOperation({ summary: 'Create task rows for any ACTIVE enrollment that has none (admin, idempotent)' })
  adminBackfillMissingTasks() {
    return this.virtualInternship.adminBackfillMissingTasks();
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('admin/submissions/:taskId/review')
  @ApiOperation({ summary: 'Approve or request changes on a task submission (admin)' })
  adminReviewTask(
    @CurrentUser('sub') adminId: string,
    @Param('taskId') taskId: string,
    @Body() dto: ReviewVirtualInternshipTaskDto,
  ) {
    return this.virtualInternship.adminReviewTask(adminId, taskId, dto);
  }
}
