import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { VerificationService } from './verification.service';
import {
  ConfirmCollegeEmailDto,
  CreateVerificationRequestDto,
  RejectVerificationDto,
  RequestCollegeEmailDto,
  VerificationQueryDto,
  VerificationUploadUrlDto,
} from './dto/verification.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('verification')
@ApiBearerAuth()
@Controller('verification')
export class VerificationController {
  constructor(private readonly verification: VerificationService) {}

  @Post('upload-url')
  @ApiOperation({ summary: 'Presigned URL for ID-card / admission-proof upload' })
  uploadUrl(@Body() dto: VerificationUploadUrlDto) {
    return this.verification.getUploadUrl(dto);
  }

  @Post('college-email/request')
  @ApiOperation({ summary: 'Send a verification link to a college email' })
  requestCollegeEmail(@CurrentUser('sub') userId: string, @Body() dto: RequestCollegeEmailDto) {
    return this.verification.requestCollegeEmail(userId, dto);
  }

  @Post('college-email/confirm')
  @ApiOperation({ summary: 'Confirm a college-email verification token' })
  confirmCollegeEmail(@CurrentUser('sub') userId: string, @Body() dto: ConfirmCollegeEmailDto) {
    return this.verification.confirmCollegeEmail(userId, dto);
  }

  @Post('request')
  @ApiOperation({ summary: 'Submit a student verification request' })
  submit(@CurrentUser('sub') userId: string, @Body() dto: CreateVerificationRequestDto) {
    return this.verification.submit(userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'My latest verification request + status' })
  mine(@CurrentUser('sub') userId: string) {
    return this.verification.mine(userId);
  }

  // ---- Admin review ----
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get('requests')
  @ApiOperation({ summary: 'Pending verification queue (admin)' })
  queue(@Query() query: VerificationQueryDto) {
    return this.verification.listForReview(query);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('requests/:id/approve')
  @ApiOperation({ summary: 'Approve a verification request (admin)' })
  approve(@CurrentUser('sub') adminId: string, @Param('id') id: string) {
    return this.verification.decide(adminId, id, true);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post('requests/:id/reject')
  @ApiOperation({ summary: 'Reject a verification request (admin)' })
  reject(
    @CurrentUser('sub') adminId: string,
    @Param('id') id: string,
    @Body() dto: RejectVerificationDto,
  ) {
    return this.verification.decide(adminId, id, false, dto.note);
  }
}
