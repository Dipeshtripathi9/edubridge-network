import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResourceType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class UploadUrlDto {
  @ApiProperty({ example: 'dsa-notes.pdf' })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  contentType!: string;
}

export class CreateResourceDto {
  @ApiProperty({ enum: ResourceType })
  @IsEnum(ResourceType)
  type!: ResourceType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Google Drive / external link to the resource' })
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'Enter a valid link (including https://)' })
  @MaxLength(2000)
  externalUrl?: string;

  @ApiPropertyOptional({ description: 'S3 object key returned from /resources/upload-url (legacy file upload)' })
  @IsOptional()
  @IsString()
  fileKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  fileSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  collegeTag?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  courseTag?: string;

  @ApiPropertyOptional({ description: 'Scope this resource to a college community' })
  @IsOptional()
  @IsString()
  collegeId?: string;

  @ApiPropertyOptional({ description: 'Scope this resource to a community' })
  @IsOptional()
  @IsString()
  communityId?: string;
}

export class ResourceQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ResourceType })
  @IsOptional()
  @IsEnum(ResourceType)
  type?: ResourceType;

  @ApiPropertyOptional({ description: 'Search on title' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: 'Only resources scoped to this college' })
  @IsOptional()
  @IsString()
  collegeId?: string;

  @ApiPropertyOptional({ description: 'Only resources scoped to this community' })
  @IsOptional()
  @IsString()
  communityId?: string;

  @ApiPropertyOptional({ enum: ['recent', 'top', 'downloads'], default: 'recent' })
  @IsOptional()
  @IsString()
  sort?: 'recent' | 'top' | 'downloads';
}

export class RateResourceDto {
  @ApiProperty({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  value!: number;
}

export class ResourceCommentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  body!: string;
}
