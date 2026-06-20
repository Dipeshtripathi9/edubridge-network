import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class LeaderboardQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Limit leaderboard to a college' })
  @IsOptional()
  @IsString()
  collegeId?: string;
}
