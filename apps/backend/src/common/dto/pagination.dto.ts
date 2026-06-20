import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({ description: 'Cursor for infinite scroll (id of last item)' })
  @IsOptional()
  @IsString()
  cursor?: string;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total?: number;
    page: number;
    limit: number;
    hasMore: boolean;
    nextCursor?: string | null;
  };
}

export function buildPaginatedResult<T extends { id: string }>(
  items: T[],
  pagination: PaginationDto,
  total?: number,
): PaginatedResult<T> {
  const hasMore = items.length === pagination.limit;
  return {
    data: items,
    meta: {
      total,
      page: pagination.page,
      limit: pagination.limit,
      hasMore,
      nextCursor: hasMore ? items[items.length - 1]?.id ?? null : null,
    },
  };
}
