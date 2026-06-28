import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateAdCardDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  body?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2000)
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Where the ad CTA links to' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2000)
  linkUrl?: string;

  @ApiProperty({ description: 'The day the ad should start running (must be a future day).' })
  @IsDateString()
  scheduledFor!: string;
}
