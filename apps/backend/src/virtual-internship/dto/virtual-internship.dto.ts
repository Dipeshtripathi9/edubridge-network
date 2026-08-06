import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentStatus, VirtualInternshipTrack } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class EnrollVirtualInternshipDto {
  @ApiProperty({ enum: VirtualInternshipTrack })
  @IsEnum(VirtualInternshipTrack)
  track!: VirtualInternshipTrack;
}

export class SubmitPaymentReferenceDto {
  @ApiProperty({ description: 'Reference note for the manual payment (UPI ref / txn id / etc.)' })
  @IsString()
  @IsNotEmpty()
  paymentReferenceNote!: string;
}

export class VirtualInternshipQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: EnrollmentStatus })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;
}

export class ConfirmPaymentDto {
  @ApiPropertyOptional({ description: 'Optional admin note recorded alongside the confirmation' })
  @IsOptional()
  @IsString()
  mentorNote?: string;
}
