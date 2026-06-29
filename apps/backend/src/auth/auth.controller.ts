import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import {
  ForgotPasswordDto,
  GoogleAuthDto,
  LoginDto,
  MagicLinkRequestDto,
  MagicLinkVerifyDto,
  RefreshDto,
  RequestOtpDto,
  ResetPasswordDto,
  SignupDto,
  VerifyEmailDto,
  VerifyOtpDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private meta(req: Request) {
    return { userAgent: req.headers['user-agent'], ip: req.ip };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('signup')
  @ApiOperation({ summary: 'Register with email + password' })
  signup(@Body() dto: SignupDto) {
    return this.auth.signup(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  @ApiOperation({ summary: 'Login with email + password' })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.auth.login(dto, this.meta(req));
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate refresh token' })
  refresh(@Body() dto: RefreshDto, @Req() req: Request) {
    return this.auth.refresh(dto.refreshToken, this.meta(req));
  }

  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Logout current session' })
  logout(@CurrentUser() user: JwtUser) {
    return this.auth.logout(user.sessionId);
  }

  @ApiBearerAuth()
  @Post('logout-all')
  @ApiOperation({ summary: 'Logout from all devices' })
  logoutAll(@CurrentUser('sub') userId: string) {
    return this.auth.logoutAll(userId);
  }

  @Public()
  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.auth.verifyEmail(dto);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  @Public()
  @Post('google')
  @ApiOperation({ summary: 'Login/Signup with a Google ID token' })
  google(@Body() dto: GoogleAuthDto, @Req() req: Request) {
    return this.auth.googleAuth(dto, this.meta(req));
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('magic/request')
  @ApiOperation({ summary: 'Email a passwordless sign-in link' })
  requestMagicLink(@Body() dto: MagicLinkRequestDto) {
    return this.auth.requestMagicLink(dto);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('magic/verify')
  @ApiOperation({ summary: 'Verify a magic link token and sign in' })
  verifyMagicLink(@Body() dto: MagicLinkVerifyDto, @Req() req: Request) {
    return this.auth.verifyMagicLink(dto, this.meta(req));
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('otp/request')
  @ApiOperation({ summary: 'Request a phone OTP' })
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.auth.requestOtp(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify phone OTP and login' })
  verifyOtp(@Body() dto: VerifyOtpDto, @Req() req: Request) {
    return this.auth.verifyOtp(dto, this.meta(req));
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Current authenticated user (from token)' })
  me(@CurrentUser() user: JwtUser) {
    return user;
  }
}
