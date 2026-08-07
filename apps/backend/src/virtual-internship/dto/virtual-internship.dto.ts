import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentStatus, VirtualInternshipTrack } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class EnrollVirtualInternshipDto {
  @ApiProperty({ enum: VirtualInternshipTrack })
  @IsEnum(VirtualInternshipTrack)
  track!: VirtualInternshipTrack;
}

export class SubmitPaymentReferenceDto {
  @ApiProperty({ description: 'Reference note for the manual payment (UPI ref / txn id / etc.)' })
  @IsString()
  @IsNotEmpty()
  paymentReferenceNote!: string;
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
