import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateReviewDto {
  @ApiProperty({ enum: ReviewCategory })
  @IsEnum(ReviewCategory)
  category!: ReviewCategory;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  body!: string;
}

export class ReviewQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ReviewCategory })
  @IsOptional()
  @IsEnum(ReviewCategory)
  category?: ReviewCategory;

  @ApiPropertyOptional({ enum: ['top', 'recent'], default: 'top' })
  @IsOptional()
  @IsString()
  sort?: 'top' | 'recent';
}

export class VoteReviewDto {
  @ApiProperty({ enum: [1, -1], description: '1 = upvote, -1 = downvote' })
  @Type(() => Number)
  @IsIn([1, -1])
  value!: number;
}
