import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CollegeQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by college name' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ enum: ['rank', 'rating', 'name'], default: 'rank' })
  @IsOptional()
  @IsString()
  sort?: 'rank' | 'rating' | 'name';
}
