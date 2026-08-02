import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

// class-validator's whitelist option only preserves nested-object properties
// it can see via @ValidateNested + @Type — an untyped array of plain objects
// gets silently stripped down to empty objects/arrays under whitelist:true.
export class CollegeCourseQnaDto {
  @IsString()
  question!: string;

  @IsString()
  answer!: string;
}

export class CreateCollegeCourseDto {
  @IsString()
  field!: string;

  @IsString()
  degree!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialization?: string;

  // ---------- 1. Admissions ----------
  @ApiPropertyOptional() @IsOptional() @IsString() eligibility?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() entranceExam?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cutoff?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() admissionProcess?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() documents?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seatMatrix?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reservation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() counselling?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() managementQuota?: string;

  // ---------- 2. Fees ----------
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() tuitionFee?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() registrationFee?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() examFee?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() hostelFee?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() otherCharges?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() totalCost?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() refundPolicy?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() emiAvailable?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() educationLoanAvailable?: boolean;

  // ---------- 3. Placements ----------
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() placementPct?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() avgPackage?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() medianPackage?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() highestPackage?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() branchWisePlacement?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() internshipPct?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() ppoPct?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() topRecruiters?: string;

  // ---------- 4. ROI ----------
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() totalInvestment?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() averageSalary?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() expectedRoi?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() breakEvenTime?: string;

  // ---------- 5. Opportunities ----------
  @ApiPropertyOptional() @IsOptional() @IsString() scholarshipsInfo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() internshipsInfo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() hackathons?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() researchProjects?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() exchangeProgram?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() startupCell?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() incubation?: string;

  // ---------- 6. Career Opportunities ----------
  @ApiPropertyOptional() @IsOptional() @IsString() jobRoles?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() governmentJobs?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() higherStudies?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() certifications?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() studyAbroad?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() entrepreneurship?: string;

  // ---------- 7. Reviews (curated aggregate) ----------
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() facultyRating?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() placementRating?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() courseRating?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() curriculumRating?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() verifiedReviewsCount?: number;

  // ---------- 8. Q&A ----------
  @ApiPropertyOptional({ type: [CollegeCourseQnaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollegeCourseQnaDto)
  qna?: CollegeCourseQnaDto[];
}

export class UpdateCollegeCourseDto extends PartialType(CreateCollegeCourseDto) {}
