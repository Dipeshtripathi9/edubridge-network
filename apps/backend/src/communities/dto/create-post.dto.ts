import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CreatePollDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  multiple?: boolean;

  @ApiProperty({ type: [String], minItems: 2, maxItems: 8 })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(8)
  @IsString({ each: true })
  options!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expiresAt?: string;
}

export class CreatePostDto {
  @ApiPropertyOptional({ enum: PostType, default: PostType.TEXT })
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  body!: string;

  @ApiPropertyOptional({ type: [String], description: 'S3 keys' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Mentioned user ids' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];

  @ApiPropertyOptional({ type: CreatePollDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreatePollDto)
  poll?: CreatePollDto;
}
