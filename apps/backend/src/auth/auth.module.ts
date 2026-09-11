import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenService } from './services/token.service';
import { OtpService } from './services/otp.service';
import { GoogleService } from './services/google.service';
import { ReferralCodeModule } from '../referral-code/referral-code.module';

@Module({
  imports: [PassportModule, JwtModule.register({}), ReferralCodeModule],
  controllers: [AuthController],
  providers: [AuthService, TokenService, OtpService, GoogleService, JwtStrategy],
  exports: [TokenService, GoogleService],
})
export class AuthModule {}
