import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { InternshipsModule } from '../internships/internships.module';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { VirtualInternshipController } from './virtual-internship.controller';
import { VirtualInternshipService } from './virtual-internship.service';

@Module({
  imports: [NotificationsModule, InternshipsModule, QuizzesModule],
  controllers: [VirtualInternshipController],
  providers: [VirtualInternshipService],
  exports: [VirtualInternshipService],
})
export class VirtualInternshipModule {}
