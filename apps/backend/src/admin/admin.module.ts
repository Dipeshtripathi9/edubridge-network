import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { ReportsController } from './reports.controller';
import { AdminService } from './admin.service';
import { AuditService } from './audit.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminController, ReportsController],
  providers: [AdminService, AuditService],
  exports: [AdminService, AuditService],
})
export class AdminModule {}
