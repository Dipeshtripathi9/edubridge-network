import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransferStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateTransferDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fromCollegeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  toCollegeId?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 6 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(6)
  currentYear?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  cgpa?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branch?: string;
}

export class UpdateTransferDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  toCollegeId?: string;

  @ApiPropertyOptional({ enum: TransferStatus })
  @IsOptional()
  @IsEnum(TransferStatus)
  status?: TransferStatus;
}

export class ShareStoryDto {
  @ApiProperty({ description: 'Your transfer story to share publicly' })
  @IsString()
  @MaxLength(10000)
  story!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isStoryPublic?: boolean;
}

export class TransferStoryQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter stories by destination college id' })
  @IsOptional()
  @IsString()
  toCollegeId?: string;
}

export class UpsertRequirementDto {
  @ApiProperty()
  @IsString()
  collegeId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branch?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  minCgpa?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minYear?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxYear?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  creditTransfer?: boolean;

  @ApiPropertyOptional({ description: 'ISO date' })
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  feeAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
