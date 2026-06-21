import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationMethod } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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

  @ApiPropertyOptional({ description: 'Required for COLLEGE_EMAIL method' })
  @IsOptional()
  @IsEmail()
  collegeEmail?: string;

  @ApiPropertyOptional({ description: 'S3 key for ID_CARD / ADMISSION_PROOF' })
  @IsOptional()
  @IsString()
  evidenceKey?: string;
}

export class VerificationQueryDto extends PaginationDto {}

export class RejectVerificationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
