import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TrackBAllocationType, TrackBApplicationStatus } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class ApplyTrackBDto {
  @ApiProperty({ type: [String], description: 'Skills the applicant brings' })
  @IsArray()
  @IsString({ each: true })
  skills!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;
}

export class SubmitTrackBWorkDto {
  @ApiProperty({ description: 'Link to the submitted work' })
  @IsUrl()
  submissionUrl!: string;
}

export class TrackBQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: TrackBApplicationStatus })
  @IsOptional()
  @IsEnum(TrackBApplicationStatus)
  status?: TrackBApplicationStatus;
}

export class AllocateTrackBDto {
  @ApiProperty({ enum: TrackBAllocationType })
  @IsEnum(TrackBAllocationType)
  allocationType!: TrackBAllocationType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  allocationNote?: string;

  @ApiPropertyOptional({ description: 'Only meaningful for PAID_CLIENT_WORK' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  payoutAmount?: number;
}

export class ReviewTrackBDto {
  @ApiProperty({ description: 'true = approve, false = reject' })
  @IsBoolean()
  approve!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewNote?: string;
}

export class PayoutSentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  payoutNote?: string;
}
