import { Module } from '@nestjs/common';
import { InternshipListingsController } from './internship-listings.controller';
import { InternshipListingsService } from './internship-listings.service';

@Module({
  controllers: [InternshipListingsController],
  providers: [InternshipListingsService],
  exports: [InternshipListingsService],
})
export class InternshipListingsModule {}
