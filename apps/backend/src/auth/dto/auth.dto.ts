import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const STRONG_PASSWORD =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export class SignupDto {
  @ApiProperty({ example: 'student@college.edu' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Str0ngPass', minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(STRONG_PASSWORD, {
    message: 'Password must contain uppercase, lowercase and a number (min 8 chars).',
  })
  password!: string;

  @ApiProperty({ example: 'Aarav Sharma' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiPropertyOptional({ example: 'Male' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  gender?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'student@college.edu' })
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(STRONG_PASSWORD, {
    message: 'Password must contain uppercase, lowercase and a number (min 8 chars).',
  })
  password!: string;
}

export class VerifyEmailDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class GoogleAuthDto {
  @ApiProperty({ description: 'Google ID token from the frontend' })
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}

export class MagicLinkRequestDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ description: 'Used as the display name when creating a new account' })
  @IsOptional()
  @IsString()
  fullName?: string;
}

export class MagicLinkVerifyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class RequestOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsPhoneNumber('IN')
  phone!: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsPhoneNumber('IN')
  phone!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  code!: string;
}
