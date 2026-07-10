import { Module } from '@nestjs/common';
import { ProfileLeadsController } from './profile-leads.controller';
import { ProfileLeadsService } from './profile-leads.service';

@Module({
  controllers: [ProfileLeadsController],
  providers: [ProfileLeadsService],
})
export class ProfileLeadsModule {}
