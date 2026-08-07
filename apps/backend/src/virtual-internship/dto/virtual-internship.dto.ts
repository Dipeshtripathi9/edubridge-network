import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentStatus, TaskSubmissionStatus, VirtualInternshipTrack } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class EnrollVirtualInternshipDto {
  @ApiProperty({ enum: VirtualInternshipTrack })
  @IsEnum(VirtualInternshipTrack)
  track!: VirtualInternshipTrack;
}

export class SubmitPaymentReferenceDto {
  @ApiProperty({ description: 'UTR / UPI reference number for the manual payment' })
  @IsString()
  @IsNotEmpty()
  paymentReferenceNote!: string;
}

export class UpdateTrackConfigDto {
  @ApiPropertyOptional({ description: 'External payment link students are sent to pay (e.g. a UPI/Razorpay payment link)' })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({ description: 'Base fee (before GST) for this track, in INR. Only affects future enrollments.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  baseFeeAmount?: number;
}

export class RejectPaymentDto {
  @ApiPropertyOptional({ description: 'Optional note explaining the rejection, shown to the student' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class VirtualInternshipQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: EnrollmentStatus })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;
}

export class ConfirmPaymentDto {
  @ApiPropertyOptional({ description: 'Optional admin note recorded alongside the confirmation' })
  @IsOptional()
  @IsString()
  mentorNote?: string;
}

export class EvaluateEnrollmentDto {
  @ApiProperty({ description: 'Whether the final project passed review' })
  @IsBoolean()
  passed!: boolean;

  @ApiPropertyOptional({ description: 'Optional reviewer note (feedback, reason for failing, etc.)' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpsertTaskDto {
  @ApiProperty({ enum: VirtualInternshipTrack })
  @IsEnum(VirtualInternshipTrack)
  track!: VirtualInternshipTrack;

  @ApiPropertyOptional({ description: 'Month number (1-4). Omit for the FOUR_WEEK track.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  monthNum?: number;

  @ApiProperty({ description: 'Week number within the month/track (1-4)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  weekNum!: number;

  @ApiPropertyOptional({ description: 'Only meaningful when monthNum is set' })
  @IsOptional()
  @IsString()
  monthTitle?: string;

  @ApiPropertyOptional({ description: 'Only meaningful when monthNum is set' })
  @IsOptional()
  @IsString()
  monthDesc?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  objective!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deliverable!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  steps!: string[];

  @ApiProperty({ example: '8–10 hours' })
  @IsString()
  @IsNotEmpty()
  hours!: string;
}

export class SubmitTaskDto {
  @ApiProperty({ description: 'Link to the GitHub repo for this task' })
  @IsUrl()
  githubUrl!: string;
}

export class ReviewSubmissionDto {
  @ApiProperty({ enum: TaskSubmissionStatus, description: 'APPROVED or REJECTED' })
  @IsEnum(TaskSubmissionStatus)
  status!: TaskSubmissionStatus;

  @ApiPropertyOptional({ description: 'Note shown to the student, especially useful when rejecting' })
  @IsOptional()
  @IsString()
  reviewNote?: string;
}

export class SubmissionQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: TaskSubmissionStatus })
  @IsOptional()
  @IsEnum(TaskSubmissionStatus)
  status?: TaskSubmissionStatus;

  @ApiPropertyOptional({ enum: VirtualInternshipTrack })
  @IsOptional()
  @IsEnum(VirtualInternshipTrack)
  track?: VirtualInternshipTrack;
}

export class SubmitFeedbackDto {
  @ApiProperty({ minimum: 1, maximum: 5, description: '1-5 satisfaction rating' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}
