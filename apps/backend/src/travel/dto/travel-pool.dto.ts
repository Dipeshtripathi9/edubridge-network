import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateTravelPoolDto {
  @ApiProperty({ enum: ['TRIP', 'RIDE'] })
  @IsIn(['TRIP', 'RIDE'])
  kind!: 'TRIP' | 'RIDE';

  @ApiProperty()
  @IsString()
  @MaxLength(160)
  title!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(2)
  @Max(50)
  seats!: number;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) destination?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) returnDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) budget?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) fromLocation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) toLocation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) date?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) time?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) frequency?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) estimatedFare?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) costPerPerson?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) college?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) genderPref?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(1000) description?: string;
}
