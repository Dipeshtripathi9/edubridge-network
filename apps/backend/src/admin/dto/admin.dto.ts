import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CollegeVerificationStatus,
  ReportStatus,
  ReportTargetType,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

// ---- User-facing report creation ----
export class CreateReportDto {
  @ApiProperty({ enum: ReportTargetType })
  @IsEnum(ReportTargetType)
  targetType!: ReportTargetType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  targetId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reportedUserId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  reason!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  details?: string;
}

// ---- Admin queries / actions ----
export class AdminUserQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class SetUserStatusDto {
  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  status!: UserStatus;

  @ApiPropertyOptional({ description: 'Reason (recorded in the audit log)' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class SetUserRoleDto {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role!: UserRole;
}

export class VerifyCollegeDto {
  @ApiProperty({ enum: [CollegeVerificationStatus.VERIFIED, CollegeVerificationStatus.REJECTED] })
  @IsEnum(CollegeVerificationStatus)
  status!: CollegeVerificationStatus;
}

export class ReportQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ReportStatus })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;
}

export class ResolveReportDto {
  @ApiProperty({ enum: [ReportStatus.RESOLVED, ReportStatus.DISMISSED] })
  @IsEnum(ReportStatus)
  status!: ReportStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class ModerateContentDto {
  @ApiProperty({ enum: ['review', 'resource'] })
  @IsIn(['review', 'resource'])
  type!: 'review' | 'resource';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id!: string;
}

export class AuditQueryDto extends PaginationDto {}
