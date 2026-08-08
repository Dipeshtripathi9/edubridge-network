import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { TrackAController } from './track-a/track-a.controller';
import { TrackAService } from './track-a/track-a.service';
import { TrackBController } from './track-b/track-b.controller';
import { TrackBService } from './track-b/track-b.service';
import { CertificatesController } from './certificates/certificates.controller';
import { CertificatesService } from './certificates/certificates.service';
import { VirtualInternshipController } from './virtual-internship/virtual-internship.controller';
import { VirtualInternshipService } from './virtual-internship/virtual-internship.service';

@Module({
  imports: [NotificationsModule],
  controllers: [TrackAController, TrackBController, CertificatesController, VirtualInternshipController],
  providers: [TrackAService, TrackBService, CertificatesService, VirtualInternshipService],
  exports: [TrackAService, TrackBService, CertificatesService, VirtualInternshipService],
})
export class InternshipsModule {}
