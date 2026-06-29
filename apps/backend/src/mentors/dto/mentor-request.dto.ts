import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMentorRequestDto {
  @ApiProperty() @IsString() @MaxLength(120) name!: string;
  @ApiProperty() @IsString() @MaxLength(40) phone!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) course?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) location?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) marks?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) budget?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) preferredCollege?: string;
  @ApiPropertyOptional({ enum: ['CALL', 'CHAT'] })
  @IsOptional() @IsIn(['CALL', 'CHAT']) contactMethod?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) message?: string;
}
