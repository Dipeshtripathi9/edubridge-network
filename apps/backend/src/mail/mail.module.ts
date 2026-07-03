import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

// Global so any module (auth, verification, …) can send email without re-importing.
@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
