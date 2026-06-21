import { Module } from '@nestjs/common';
import { CollegesController } from './colleges.controller';
import { CollegesService } from './colleges.service';
import { FaqsController } from './faqs.controller';
import { FaqsService } from './faqs.service';

@Module({
  controllers: [CollegesController, FaqsController],
  providers: [CollegesService, FaqsService],
  exports: [CollegesService, FaqsService],
})
export class CollegesModule {}
