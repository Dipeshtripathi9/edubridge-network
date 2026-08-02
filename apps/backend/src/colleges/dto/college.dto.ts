import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateCollegeDto {
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  nirfRank?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accreditation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  admissionPrimary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  admissionSecondary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tuitionFeePerYear?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  verified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasScholarship?: boolean;

  // ---------- 1. College Profile ----------
  @ApiPropertyOptional() @IsOptional() @IsString() aboutCollege?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() establishmentYear?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() ownership?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() affiliation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() campusSize?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactDetails?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() brochureUrl?: string;

  // ---------- 2. Location ----------
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() googleMapsUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nearbyMetro?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nearbyRailwayStation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nearbyAirport?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nearbyRestaurants?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nearbyHospitals?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nearbyShoppingAreas?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() costOfLiving?: string;

  // ---------- 3. Rankings ----------
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() qsRank?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() naacGrade?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nbaStatus?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() indiaTodayRank?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() outlookRank?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() theWeekRank?: number;

  // ---------- 4. Infrastructure ----------
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() hasLibrary?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() hasLabs?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() hasSmartClassrooms?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() hasSportsComplex?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() hasAuditorium?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() hasCafeteria?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() hasMedicalCentre?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() hasBankAtm?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() hasWifi?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() hasSecurity?: boolean;

  // ---------- 5. Hostel ----------
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() hostelAvailable?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() boysHostel?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() girlsHostel?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() hostelFoodQuality?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() hostelLaundry?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() hostelHousekeeping?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() hostelCurfew?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() hostelSecurity?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() hostelRules?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nearbyPG?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() nearbyFlats?: string;

  // ---------- 6. Student Life ----------
  @ApiPropertyOptional() @IsOptional() @IsString() clubs?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() societies?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() technicalClubs?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() culturalClubs?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() annualFest?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() sports?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() ncc?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() nss?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() studentEvents?: string;

  // ---------- 7. College Culture ----------
  @ApiPropertyOptional() @IsOptional() @IsString() attendancePolicy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() academicPressure?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() codingCulture?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() startupCulture?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() researchCulture?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() diversity?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() campusSafety?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() antiRagging?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() studentSupport?: string;
}

export class UpdateCollegeDto extends PartialType(CreateCollegeDto) {}
