import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VirtualInternshipTrack } from '@prisma/client';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EnrollVirtualInternshipDto {
  @ApiProperty({ enum: VirtualInternshipTrack })
  @IsEnum(VirtualInternshipTrack)
  track!: VirtualInternshipTrack;

  @ApiPropertyOptional({ description: 'Free entitlement flag — does not affect the fee' })
  @IsOptional()
  @IsBoolean()
  referralApplied?: boolean;

  @ApiPropertyOptional({ description: 'Adds the flat scholarship-donation amount to the fee' })
  @IsOptional()
  @IsBoolean()
  donateApplied?: boolean;
}

export class VerifyVirtualInternshipPaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  razorpay_order_id!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  razorpay_payment_id!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  razorpay_signature!: string;
}
