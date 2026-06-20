import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenService } from './services/token.service';
import { MailService } from './services/mail.service';
import { OtpService } from './services/otp.service';
import { GoogleService } from './services/google.service';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, TokenService, MailService, OtpService, GoogleService, JwtStrategy],
  exports: [TokenService],
})
export class AuthModule {}
