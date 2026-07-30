import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BlogCategory } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateBlogPostDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(20000)
  body!: string;

  @ApiProperty({ enum: BlogCategory })
  @IsEnum(BlogCategory)
  category!: BlogCategory;
}

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
