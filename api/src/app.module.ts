import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'

import { PrismaModule } from './prisma/prisma.module'

import { WinstonModule } from 'nest-winston'
import { winstonConfig } from './config/winston.config'
import { envSchema } from './config/env.schema'

/* ================= CORE ================= */
import { HttpExceptionFilter } from './core/filters/http-exception.filter'
import { PrismaExceptionFilter } from './core/filters/prisma-exception.filter'
import { LoggingInterceptor } from './core/interceptors/logging.interceptor'
import { BigIntInterceptor } from './core/interceptors/bigint.interceptor'
import { MetricsInterceptor } from './core/observability/metrics.interceptor'

import { RedisModule } from './core/redis/redis.module'
import { CacheModule } from './core/cache/cache.module'
import { QueueModule } from './core/queue/queue.module'
import { SecurityModule } from './core/security/security.module'
import { ObservabilityModule } from './core/observability/observability.module'
import { TenantMiddleware } from './core/middleware/tenant.middleware'
import { EventsModule } from './core/events/events.module'
import { AuditMiddleware } from '@/core/middleware/audit.middleware'

/* ================= DOMAIN MODULES ================= */
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'
import { MasterModule } from './modules/master/master.module'
import { RiwayatModule } from './modules/riwayat/riwayat.module'
import { AuditModule } from './modules/audit/audit.module'
import { HealthModule } from './modules/health/health.module'
import { DashboardModule } from './modules/dashboard/dashboard.module'
import { AsnModule } from "./modules/asn/asn.module"
import { RefUnorModule } from "@/modules/ref-unor/ref-unor.module"
import { DmsMonitoringModule } from './modules/dms-monitoring/dms-monitoring.module'

/* ================= STATISTICS ================= */
import { WorkforceModule } from "./modules/statistics/workforce/workforce.module"
import { StatisticsModule } from "./modules/statistics/statistics.module"
import { ServicesModule } from './modules/services/orchestrator/services.module'
import { IntegrasiModule } from './modules/integrasi/integrasi.module'

@Module({
  imports: [

    /* ================= ENV ================= */
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: [
        `.env.${process.env.APP_ENV ?? 'development'}`,
        '.env',
      ],
      validate: (env) => envSchema.parse(env),
    }),

    /* ================= LOGGING ================= */
    WinstonModule.forRoot(winstonConfig),

    /* ================= DATABASE ================= */
    PrismaModule,

    /* ================= INFRASTRUCTURE ================= */
    CacheModule,
    QueueModule,
    SecurityModule,
    ObservabilityModule,
    EventsModule,
    RedisModule.register(),

    /* ================= DOMAIN ================= */
    AuthModule,
    UserModule,
    MasterModule,
    RiwayatModule,
    AuditModule,
    HealthModule,
    DashboardModule,
    AsnModule,
    RefUnorModule,
    DmsMonitoringModule,

    /* ================= STATISTICS ================= */
    WorkforceModule,
    StatisticsModule,

    /* ================= PENSIUN ================= */
    ServicesModule,
    IntegrasiModule,
  ],

  providers: [

    /* ================= GLOBAL FILTERS ================= */
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },

    /* ================= GLOBAL INTERCEPTORS ================= */
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
    { provide: APP_INTERCEPTOR, useClass: BigIntInterceptor },

  ],

})
export class AppModule implements NestModule {

  configure(consumer: MiddlewareConsumer) {

    consumer.apply(TenantMiddleware).forRoutes('*')
    consumer.apply(AuditMiddleware).forRoutes('*')

  }

}
