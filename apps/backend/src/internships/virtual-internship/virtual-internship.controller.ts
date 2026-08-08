import { Body, Controller, Get, Headers, Post, Param, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { VirtualInternshipService } from './virtual-internship.service';
import { EnrollVirtualInternshipDto, VerifyVirtualInternshipPaymentDto } from './dto/virtual-internship.dto';
import { Public } from '../../common/decorators/public.decorator';
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
}
