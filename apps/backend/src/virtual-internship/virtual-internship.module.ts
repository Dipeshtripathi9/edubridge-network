import { Module } from '@nestjs/common';
import { VirtualInternshipController } from './virtual-internship.controller';
import { VirtualInternshipService } from './virtual-internship.service';

@Module({
  controllers: [VirtualInternshipController],
  providers: [VirtualInternshipService],
})
export class VirtualInternshipModule {}
