import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class EligibilityCheckDto {
  @ApiProperty({ example: 7.8, description: 'Current CGPA' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  cgpa!: number;

  @ApiProperty({ example: 2, description: 'Current year of study' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(6)
  currentYear!: number;

  @ApiProperty({ example: 'Computer Science and Engineering' })
  @IsString()
  branch!: string;

  @ApiPropertyOptional({ description: 'Current college id (excluded from results)' })
  @IsOptional()
  @IsString()
  currentCollegeId?: string;

  @ApiPropertyOptional({ description: 'Only colleges offering credit transfer' })
  @IsOptional()
  @Type(() => Boolean)
  creditTransferOnly?: boolean;
}
