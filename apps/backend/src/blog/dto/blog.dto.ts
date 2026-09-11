import { ApiPropertyOptional } from '@nestjs/swagger';
import { BlogCategory } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class BlogQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: BlogCategory })
  @IsOptional()
  @IsEnum(BlogCategory)
  category?: BlogCategory;

  @ApiPropertyOptional({ description: 'Filter by author college' })
  @IsOptional()
  @IsString()
  collegeId?: string;
}
