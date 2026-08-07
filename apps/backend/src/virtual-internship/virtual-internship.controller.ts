import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole, VirtualInternshipTrack } from '@prisma/client';
import { VirtualInternshipService } from './virtual-internship.service';
import {
  ConfirmPaymentDto,
  EnrollVirtualInternshipDto,
  EvaluateEnrollmentDto,
  RejectPaymentDto,
  ReviewSubmissionDto,
  SubmissionQueryDto,
  SubmitFeedbackDto,
  SubmitPaymentReferenceDto,
  SubmitTaskDto,
  UpdateTrackConfigDto,
  UpsertTaskDto,
  VirtualInternshipQueryDto,
} from './dto/virtual-internship.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('virtual-internship')
@ApiBearerAuth()
@Controller('virtual-internship')
export class VirtualInternshipController {
  constructor(private readonly virtualInternship: VirtualInternshipService) {}

  // ---- Public ----

  @Public()
  @Get('pricing')
  @ApiOperation({ summary: 'Current effective price per track (base + GST breakdown)' })
  getPricing() {
    return this.virtualInternship.getPricing();
  }

  @Public()
  @Get('tasks')
  @ApiOperation({ summary: "A track's curriculum tasks (admin-editable content)" })
  listTasks(@Query('track') track: VirtualInternshipTrack) {
    return this.virtualInternship.listTasks(track);
  }

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

  @Post('enrollments/:id/feedback')
  @ApiOperation({ summary: 'Leave satisfaction feedback for a completed enrollment' })
  submitFeedback(@CurrentUser('sub') userId: string, @Param('id') id: string, @Body() dto: SubmitFeedbackDto) {
    return this.virtualInternship.submitFeedback(userId, id, dto);
  }

  @Get('enrollments/:id/feedback')
  @ApiOperation({ summary: 'My feedback for this enrollment, if any' })
  myFeedback(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.virtualInternship.myFeedback(userId, id);
  }

  @Post('enrollments/:id/payment-link-clicked')
  @ApiOperation({ summary: 'Record that the student clicked "Pay" and notify admins' })
  markPaymentLinkClicked(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.virtualInternship.markPaymentLinkClicked(userId, id);
  }

  @Post('tasks/:id/submit')
  @ApiOperation({ summary: 'Submit (or update) your GitHub link for a task' })
  submitTask(@CurrentUser('sub') userId: string, @Param('id') id: string, @Body() dto: SubmitTaskDto) {
    return this.virtualInternship.submitTask(userId, id, dto);
  }

  @Get('enrollments/:id/submissions')
  @ApiOperation({ summary: 'My task submissions for this enrollment' })
  mySubmissions(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.virtualInternship.mySubmissions(userId, id);
  }

  // ---- Admin ----

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('enrollments')
  @ApiOperation({ summary: 'List Virtual Internship enrollments (admin)' })
  listEnrollments(@Query() query: VirtualInternshipQueryDto) {
    return this.virtualInternship.listEnrollments(query);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('metrics')
  @ApiOperation({ summary: 'Aggregate enrollment/certificate counts (admin)' })
  metrics() {
    return this.virtualInternship.metrics();
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('track-config')
  @ApiOperation({ summary: 'List each track\'s price + payment link, override and effective (admin)' })
  getTrackConfigs() {
    return this.virtualInternship.getTrackConfigs();
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Put('track-config/:track')
  @ApiOperation({ summary: 'Set/update the price and/or payment link for a track (admin)' })
  updateTrackConfig(
    @CurrentUser('sub') adminId: string,
    @Param('track') track: string,
    @Body() dto: UpdateTrackConfigDto,
  ) {
    return this.virtualInternship.updateTrackConfig(adminId, track, dto);
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

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('enrollments/:id/reject-payment')
  @ApiOperation({ summary: 'Reject an unverifiable payment — cancels the enrollment (admin)' })
  rejectPayment(@CurrentUser('sub') adminId: string, @Param('id') id: string, @Body() dto: RejectPaymentDto) {
    return this.virtualInternship.rejectPayment(adminId, id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('enrollments/:id/evaluate')
  @ApiOperation({ summary: 'Record the final-project evaluation result (admin)' })
  evaluate(
    @CurrentUser('sub') adminId: string,
    @Param('id') id: string,
    @Body() dto: EvaluateEnrollmentDto,
  ) {
    return this.virtualInternship.evaluate(adminId, id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('enrollments/:id/complete')
  @ApiOperation({ summary: 'Mark an enrollment complete and issue its certificate (admin)' })
  complete(@CurrentUser('sub') adminId: string, @Param('id') id: string) {
    return this.virtualInternship.complete(adminId, id);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Put('tasks')
  @ApiOperation({ summary: 'Create/update a curriculum task for a track+month+week (admin)' })
  upsertTask(@CurrentUser('sub') adminId: string, @Body() dto: UpsertTaskDto) {
    return this.virtualInternship.upsertTask(adminId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete('tasks/:id')
  @ApiOperation({ summary: 'Delete a curriculum task (admin)' })
  deleteTask(@CurrentUser('sub') adminId: string, @Param('id') id: string) {
    return this.virtualInternship.deleteTask(adminId, id);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('submissions')
  @ApiOperation({ summary: 'List student task submissions, optionally filtered (admin)' })
  listSubmissions(@Query() query: SubmissionQueryDto) {
    return this.virtualInternship.listSubmissions(query);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('submissions/:id/review')
  @ApiOperation({ summary: 'Approve or reject a task submission (admin)' })
  reviewSubmission(@CurrentUser('sub') adminId: string, @Param('id') id: string, @Body() dto: ReviewSubmissionDto) {
    return this.virtualInternship.reviewSubmission(adminId, id, dto);
  }
}
