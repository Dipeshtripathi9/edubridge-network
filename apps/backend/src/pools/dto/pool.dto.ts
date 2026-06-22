import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreatePoolDto {
  @ApiProperty({ description: 'Pool heading' })
  @IsString()
  @MaxLength(120)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Max members allowed in the pool (2–50)', default: 10 })
  @IsInt()
  @Min(2)
  @Max(50)
  maxMembers!: number;
}
