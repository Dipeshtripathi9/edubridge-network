import { Module } from '@nestjs/common';
import { ReferralCodeService } from './referral-code.service';
import { ReferralSignupLogService } from './referral-signup-log.service';

@Module({
  providers: [ReferralCodeService, ReferralSignupLogService],
  exports: [ReferralCodeService, ReferralSignupLogService],
})
export class ReferralCodeModule {}
