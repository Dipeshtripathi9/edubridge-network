import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommunityRole } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class SetMemberRoleDto {
  @ApiProperty({ enum: CommunityRole })
  @IsEnum(CommunityRole)
  role!: CommunityRole;
}

export class ApplyHeadDto {
  @ApiProperty({ enum: CommunityRole, description: 'CAMPUS_LEAD / OPPORTUNITY_HEAD / STUDENT_RELATIONS_HEAD / MODERATOR' })
  @IsEnum(CommunityRole)
  requestedRole!: CommunityRole;

  @ApiPropertyOptional({ description: 'Why you should lead (optional)' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  pitch?: string;
}

export class AppointHeadDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: CommunityRole })
  @IsEnum(CommunityRole)
  role!: CommunityRole;
}

export class HeadDecisionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class ResolveCommunityReportDto {
  @ApiProperty({ enum: ['RESOLVED', 'DISMISSED'] })
  @IsIn(['RESOLVED', 'DISMISSED'])
  status!: 'RESOLVED' | 'DISMISSED';
}

export class ModerateMemberDto {
  @ApiProperty({ enum: ['mute', 'unmute', 'ban', 'unban'] })
  @IsIn(['mute', 'unmute', 'ban', 'unban'])
  action!: 'mute' | 'unmute' | 'ban' | 'unban';

  @ApiPropertyOptional({ description: 'Mute duration in minutes (default 60)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minutes?: number;
}
