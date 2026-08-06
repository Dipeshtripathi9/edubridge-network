import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { VirtualInternshipController } from './virtual-internship.controller';
import { VirtualInternshipService } from './virtual-internship.service';

@Module({
  imports: [NotificationsModule],
  controllers: [VirtualInternshipController],
  providers: [VirtualInternshipService],
  exports: [VirtualInternshipService],
})
export class VirtualInternshipModule {}
