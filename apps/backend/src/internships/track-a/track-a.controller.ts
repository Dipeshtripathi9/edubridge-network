import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { TrackAService } from './track-a.service';
import {
  AssignTaskDto,
  ConfirmPaymentDto,
  EnrollTrackADto,
  ReviewTaskDto,
  SubmitPaymentReferenceDto,
  SubmitTaskWorkDto,
  TrackAQueryDto,
} from './dto/track-a.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@ApiTags('internships-track-a')
@ApiBearerAuth()
@Controller('internships')
export class TrackAController {
  constructor(private readonly trackA: TrackAService) {}

  @Public()
  @Get('pricing')
  @ApiOperation({ summary: 'Public Track A / Track B pricing info' })
  pricing() {
    return this.trackA.pricing();
  }

  // ---- Student ----

  @Post('enroll')
  @ApiOperation({ summary: 'Enroll in Track A' })
  enroll(@CurrentUser('sub') userId: string, @Body() dto: EnrollTrackADto) {
    return this.trackA.enroll(userId, dto);
  }

  @Get('enrollments/me')
  @ApiOperation({ summary: 'My latest Track A enrollment' })
  myEnrollment(@CurrentUser('sub') userId: string) {
    return this.trackA.myEnrollment(userId);
  }

  @Get('enrollments/:id')
  @ApiOperation({ summary: 'Get a Track A enrollment (owner or admin)' })
  getEnrollment(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.trackA.getEnrollment(user.sub, user.role, id);
  }

  @Patch('enrollments/:id/payment-reference')
  @ApiOperation({ summary: 'Submit / update the manual-payment reference note' })
  submitPaymentReference(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: SubmitPaymentReferenceDto,
  ) {
    return this.trackA.submitPaymentReference(userId, id, dto);
  }

  @Post('tasks/:taskId/submit')
  @ApiOperation({ summary: 'Submit work for an assigned task' })
  submitTaskWork(
    @CurrentUser('sub') userId: string,
    @Param('taskId') taskId: string,
    @Body() dto: SubmitTaskWorkDto,
  ) {
    return this.trackA.submitTaskWork(userId, taskId, dto);
  }

  // ---- Admin ----

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('enrollments')
  @ApiOperation({ summary: 'List Track A enrollments (admin)' })
  listEnrollments(@Query() query: TrackAQueryDto) {
    return this.trackA.listEnrollments(query);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('enrollments/:id/confirm-payment')
  @ApiOperation({ summary: 'Confirm the manually-verified payment (admin)' })
  confirmPayment(
    @CurrentUser('sub') adminId: string,
    @Param('id') id: string,
    @Body() dto: ConfirmPaymentDto,
  ) {
    return this.trackA.confirmPayment(adminId, id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('enrollments/:id/tasks')
  @ApiOperation({ summary: 'Assign a milestone task (admin)' })
  assignTask(@CurrentUser('sub') adminId: string, @Param('id') id: string, @Body() dto: AssignTaskDto) {
    return this.trackA.assignTask(adminId, id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('tasks/:taskId/review')
  @ApiOperation({ summary: 'Approve / reject a task submission (admin)' })
  reviewTask(
    @CurrentUser('sub') adminId: string,
    @Param('taskId') taskId: string,
    @Body() dto: ReviewTaskDto,
  ) {
    return this.trackA.reviewTaskSubmission(adminId, taskId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('enrollments/:id/complete')
  @ApiOperation({ summary: 'Mark an enrollment complete and issue its certificate (admin)' })
  complete(@CurrentUser('sub') adminId: string, @Param('id') id: string) {
    return this.trackA.complete(adminId, id);
  }
}
