import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationMethod } from '@prisma/client';
import { IsBoolean, IsEmail, IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class VerificationUploadUrlDto {
  @ApiProperty({ example: 'student-id.jpg' })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  @IsNotEmpty()
  contentType!: string;
}

export class CreateVerificationRequestDto {
  @ApiProperty({ enum: VerificationMethod })
  @IsEnum(VerificationMethod)
  method!: VerificationMethod;

  @ApiPropertyOptional({ description: 'College being verified against' })
  @IsOptional()
  @IsString()
  collegeId?: string;

  @ApiPropertyOptional({ description: 'Free-text college name when not in the directory' })
  @IsOptional()
  @IsString()
  collegeName?: string;

  @ApiPropertyOptional({ description: 'Required for COLLEGE_EMAIL method' })
  @IsOptional()
  @IsEmail()
  collegeEmail?: string;

  @ApiPropertyOptional({ description: 'S3 key for ID_CARD / ADMISSION_PROOF' })
  @IsOptional()
  @IsString()
  evidenceKey?: string;

  @ApiPropertyOptional({ description: 'Whether the student confirmed the college-email link' })
  @IsOptional()
  @IsBoolean()
  collegeEmailVerified?: boolean;

  @ApiPropertyOptional({ description: 'Honest per-category thoughts about the college' })
  @IsOptional()
  @IsObject()
  feedback?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Course / branch, e.g. B.Tech CSE' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  course?: string;

  @ApiPropertyOptional({ description: 'Year of study (1-6)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  year?: number;
}

export class RequestCollegeEmailDto {
  @ApiProperty()
  @IsEmail()
  email!: string;
}

export class ConfirmCollegeEmailDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class VerificationQueryDto extends PaginationDto {}

export class RejectVerificationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
