import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateQuizDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateQuizDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Publish or unpublish the quiz' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class AddQuestionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  prompt!: string;

  @ApiProperty({ type: [String], description: 'At least 2 answer options' })
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options!: string[];

  @ApiProperty({ description: 'Index into options[] of the correct answer' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  correctOption!: number;
}

export class SubmitAttemptDto {
  @ApiProperty({ description: 'Map of questionId -> selected option index', type: Object })
  @IsObject()
  answers!: Record<string, number>;
}
