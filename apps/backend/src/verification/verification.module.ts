import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsModule } from '../notifications/notifications.module';
import { GoogleService } from '../auth/services/google.service';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
  imports: [NotificationsModule, JwtModule.register({})],
  controllers: [VerificationController],
  // GoogleService only needs ConfigService (global), so it can be provided here
  // to verify college-email Google tokens without coupling to AuthModule.
  providers: [VerificationService, GoogleService],
  exports: [VerificationService],
})
export class VerificationModule {}
