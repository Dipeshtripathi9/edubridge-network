import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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

  @ApiPropertyOptional({ description: 'Deeplink path, e.g. /reviews/:slug' })
  @IsOptional()
  @IsString()
  link?: string;
}
