import { Module } from '@nestjs/common';
import { CampusAmbassadorController } from './campus-ambassador.controller';
import { CampusAmbassadorService } from './campus-ambassador.service';

@Module({
  controllers: [CampusAmbassadorController],
  providers: [CampusAmbassadorService],
  exports: [CampusAmbassadorService],
})
export class CampusAmbassadorModule {}
