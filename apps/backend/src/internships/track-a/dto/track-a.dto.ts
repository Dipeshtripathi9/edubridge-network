import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentStatus, EnrollmentSubtype } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class EnrollTrackADto {
  @ApiProperty({ enum: EnrollmentSubtype })
  @IsEnum(EnrollmentSubtype)
  subtype!: EnrollmentSubtype;

  @ApiProperty({ description: 'What the student wants to learn / build' })
  @IsString()
  @MinLength(10)
  projectDescription!: string;
}

export class SubmitPaymentReferenceDto {
  @ApiProperty({ description: 'Reference note for the manual payment (UPI ref / txn id / etc.)' })
  @IsString()
  @IsNotEmpty()
  paymentReferenceNote!: string;
}

export class SubmitTaskWorkDto {
  @ApiProperty({ description: 'Link to the submitted work (repo, doc, drive, deployed URL...)' })
  @IsUrl()
  submissionUrl!: string;
}

export class TrackAQueryDto extends PaginationDto {
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

export class AssignTaskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Display order; defaults to append at the end' })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class ReviewTaskDto {
  @ApiProperty({ description: 'true = approve, false = reject' })
  @IsBoolean()
  approve!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewNote?: string;
}
