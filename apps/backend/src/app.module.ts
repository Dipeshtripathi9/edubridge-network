import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { LoggerModule } from 'nestjs-pino';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransferModule } from './transfer/transfer.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { CollegesModule } from './colleges/colleges.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ResourcesModule } from './resources/resources.module';
import { StorageModule } from './storage/storage.module';
import { MessagingModule } from './messaging/messaging.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { ReferralsModule } from './referrals/referrals.module';
import { AgencyModule } from './agency/agency.module';
import { RentalsModule } from './rentals/rentals.module';
import { MentorsModule } from './mentors/mentors.module';
import { ProfileLeadsModule } from './profile-leads/profile-leads.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReputationModule } from './reputation/reputation.module';
import { AdminModule } from './admin/admin.module';
import { VerificationModule } from './verification/verification.module';
import { InternshipsModule } from './internships/internships.module';
import { SearchModule } from './search/search.module';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AppThrottlerGuard } from './common/guards/throttler.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      // Backend runs from apps/backend; the .env lives at the monorepo root.
      envFilePath: ['.env', '../../.env'],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          process.env.NODE_ENV === 'development'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
        redact: ['req.headers.authorization', 'req.body.password'],
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('rateLimit.ttl')! * 1000,
            limit: config.get<number>('rateLimit.max')!,
          },
        ],
        // Share rate-limit counters across replicas via Redis in production, so the
        // limit is global (not per-instance). Dev/test use the default in-memory
        // store (the guard is skipped in tests anyway).
        ...(config.get<string>('env') === 'production'
          ? { storage: new ThrottlerStorageRedisService(config.get<string>('redis.url')!) }
          : {}),
      }),
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    TransferModule,
    OpportunitiesModule,
    CollegesModule,
    ReviewsModule,
    StorageModule,
    ResourcesModule,
    MessagingModule,
    ReferralsModule,
    AgencyModule,
    RentalsModule,
    MentorsModule,
    ProfileLeadsModule,
    ComplaintsModule,
    NotificationsModule,
    ReputationModule,
    AdminModule,
    VerificationModule,
    InternshipsModule,
    SearchModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
  ],
})
export class AppModule {}
