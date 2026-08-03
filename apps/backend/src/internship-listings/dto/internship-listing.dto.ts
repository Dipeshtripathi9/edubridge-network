import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OpportunityType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class InternshipListingQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by title or company' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by category tag' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: OpportunityType, description: 'Filter by opportunity type' })
  @IsOptional()
  @IsEnum(OpportunityType)
  type?: OpportunityType;
}

export class CreateInternshipListingDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  company!: string;

  @ApiProperty()
  @IsString()
  location!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;

  @ApiPropertyOptional({ enum: OpportunityType, default: OpportunityType.INTERNSHIP })
  @IsOptional()
  @IsEnum(OpportunityType)
  type?: OpportunityType;

  @ApiPropertyOptional({ description: 'Monthly stipend in INR; omit for unpaid' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stipend?: number;

  @ApiProperty({ description: 'e.g. "3 months"' })
  @IsString()
  duration!: string;

  @ApiProperty({ description: 'e.g. "Engineering", "Design", "Marketing"' })
  @IsString()
  category!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsString()
  applyUrl!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadline?: string;
}

export class UpdateInternshipListingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;

  @ApiPropertyOptional({ enum: OpportunityType })
  @IsOptional()
  @IsEnum(OpportunityType)
  type?: OpportunityType;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stipend?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  applyUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  deadline?: string;
}
