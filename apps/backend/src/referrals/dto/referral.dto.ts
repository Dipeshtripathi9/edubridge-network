import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateReferralDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  role!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(120)
  company!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(2000)
  link?: string;
}
