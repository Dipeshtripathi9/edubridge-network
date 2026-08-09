import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentStatus, VirtualInternshipTrack } from '@prisma/client';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class EnrollVirtualInternshipDto {
  @ApiProperty({ enum: VirtualInternshipTrack })
  @IsEnum(VirtualInternshipTrack)
  track!: VirtualInternshipTrack;

  @ApiPropertyOptional({ description: 'Free entitlement flag — does not affect the fee' })
  @IsOptional()
  @IsBoolean()
  referralApplied?: boolean;

  @ApiPropertyOptional({ description: 'Adds the flat scholarship-donation amount to the fee' })
  @IsOptional()
  @IsBoolean()
  donateApplied?: boolean;
}

export class VerifyVirtualInternshipPaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  razorpay_order_id!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  razorpay_payment_id!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  razorpay_signature!: string;
}

export class SubmitVirtualInternshipTaskDto {
  @ApiProperty({ description: 'Link to the submitted work (repo, doc, drive, deployed URL...)' })
  @IsUrl()
  submissionUrl!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class ReviewVirtualInternshipTaskDto {
  @ApiProperty({ description: 'true = approve, false = request changes' })
  @IsBoolean()
  approve!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewNote?: string;
}

export class AssignVirtualInternshipTaskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class VirtualInternshipAdminQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: VirtualInternshipTrack })
  @IsOptional()
  @IsEnum(VirtualInternshipTrack)
  track?: VirtualInternshipTrack;

  @ApiPropertyOptional({ enum: EnrollmentStatus })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;
}

