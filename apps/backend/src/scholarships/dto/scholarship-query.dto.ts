import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ScholarshipQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by scholarship title' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by category tag' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: ['deadline', 'amount', 'title'], default: 'deadline' })
  @IsOptional()
  @IsString()
  sort?: 'deadline' | 'amount' | 'title';
}
