import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommunityType, CommunityVisibility } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommunityDto {
  @ApiProperty({ example: 'Bennett University' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ enum: CommunityType })
  @IsEnum(CommunityType)
  type!: CommunityType;

  @ApiPropertyOptional({ enum: CommunityVisibility, default: CommunityVisibility.PUBLIC })
  @IsOptional()
  @IsEnum(CommunityVisibility)
  visibility?: CommunityVisibility;

  @ApiPropertyOptional({ description: 'Topic for TOPIC communities (AI, DSA, Startups...)' })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional({ description: 'College id for COLLEGE communities' })
  @IsOptional()
  @IsString()
  collegeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bannerUrl?: string;
}
