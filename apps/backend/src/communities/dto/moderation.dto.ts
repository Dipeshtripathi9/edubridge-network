import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommunityRole } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class SetMemberRoleDto {
  @ApiProperty({ enum: CommunityRole })
  @IsEnum(CommunityRole)
  role!: CommunityRole;
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
