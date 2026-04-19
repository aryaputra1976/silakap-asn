import { Module } from '@nestjs/common'
import { SecurityLoggerService } from './security-logger.service'

import { AuditModule } from '../../modules/audit/audit.module'
import { RedisModule } from '../../core/redis/redis.module'

import { securityLogger } from '../../config/winston.config'

@Module({
  imports: [AuditModule, RedisModule],
  providers: [
    SecurityLoggerService,
    {
      provide: 'SECURITY_LOGGER',   // ← token DI NestJS
      useValue: securityLogger,     // ← instance winston
    },
  ],
  exports: [SecurityLoggerService],
})
export class SecurityModule {}