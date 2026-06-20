import { ApiPropertyOptional } from '@nestjs/swagger';
import { CommunityType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CommunityQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: CommunityType })
  @IsOptional()
  @IsEnum(CommunityType)
  type?: CommunityType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  collegeId?: string;

  @ApiPropertyOptional({ description: 'Full-text search on name' })
  @IsOptional()
  @IsString()
  q?: string;
}

export class FeedQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['recent', 'top'], default: 'recent' })
  @IsOptional()
  @IsString()
  sort?: 'recent' | 'top';
}
