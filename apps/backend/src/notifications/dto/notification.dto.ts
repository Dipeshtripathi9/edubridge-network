import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class NotificationQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Only unread' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  unread?: boolean;
}

export class BroadcastDto {
  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({ description: 'Deeplink path, e.g. /opportunities/:id' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ description: 'Target a single community (members only). Omit = all users.' })
  @IsOptional()
  @IsString()
  communityId?: string;
}

/** A community manager broadcasting to their own community's members. */
export class CommunityBroadcastDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  body?: string;

  @ApiPropertyOptional({ description: 'Deeplink path, e.g. /communities/:slug' })
  @IsOptional()
  @IsString()
  link?: string;
}
