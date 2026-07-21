import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export const SEARCH_TYPES = [
  'college',
  'user',
  'resource',
  'review',
] as const;
export type SearchType = (typeof SEARCH_TYPES)[number];

export class SearchQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search term' })
  @IsString()
  @IsNotEmpty()
  q!: string;

  @ApiPropertyOptional({ enum: SEARCH_TYPES, description: 'Restrict to one entity type' })
  @IsOptional()
  @IsIn(SEARCH_TYPES as unknown as string[])
  type?: SearchType;
}
