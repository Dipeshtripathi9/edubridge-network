import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampusAmbassadorStatus } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ApplyCampusAmbassadorDto {
  @ApiProperty({ description: 'Why the student wants to become a campus ambassador' })
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  reason!: string;
}

export class DecideCampusAmbassadorDto {
  @ApiProperty()
  @IsBoolean()
  approve!: boolean;
}

export class SetCampusAmbassadorSettingsDto {
  @ApiProperty()
  @IsBoolean()
  applicationsOpen!: boolean;
}

export class CampusAmbassadorApplicationQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: CampusAmbassadorStatus })
  @IsOptional()
  @IsEnum(CampusAmbassadorStatus)
  status?: CampusAmbassadorStatus;
}
