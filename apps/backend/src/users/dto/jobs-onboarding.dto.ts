import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

// The simplified Internships & Jobs onboarding form: name + mobile, then
// college/course/state as plain text (no catalog lookup) plus a Google
// verification token. Verification here is identity-only — any Google
// account counts, there's no college-domain check like /verify.
export class CompleteJobsOnboardingDto {
  @ApiProperty()
  @IsString()
  @MaxLength(160)
  fullName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(200)
  collegeName!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(160)
  course!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  state!: string;

  @ApiProperty({ description: 'Google ID token from GoogleVerifyButton, re-verified server-side' })
  @IsString()
  idToken!: string;
}

export class VerifyGoogleDto {
  @ApiProperty({ description: 'Google ID token from GoogleVerifyButton, re-verified server-side' })
  @IsString()
  idToken!: string;
}
