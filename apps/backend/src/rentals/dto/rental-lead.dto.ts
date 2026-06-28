import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRentalLeadDto {
  @ApiProperty({ enum: ['SEEKER', 'PROPERTY'] })
  @IsIn(['SEEKER', 'PROPERTY'])
  kind!: 'SEEKER' | 'PROPERTY';

  @ApiProperty()
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) college?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) location?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) propertyType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) budget?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) moveInDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) occupants?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) gender?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) furnished?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) requirements?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) participant?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) driveUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) details?: string;
}
