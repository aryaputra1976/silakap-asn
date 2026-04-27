import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

/**
 * Rate limiting configuration untuk aplikasi
 * Default: 100 requests per 60 seconds globally
 *
 * Per-endpoint configuration:
 * - Upload endpoint: 5 uploads per 60 seconds
 * - List batches: 30 requests per 60 seconds
 * - Validate batch: 3 per 60 seconds (expensive operation)
 * - Commit batch: 2 per 60 seconds (expensive operation)
 */
export const THROTTLER_CONFIG = {
  global: {
    ttl: 60000, // 60 seconds
    limit: 100, // 100 requests per TTL
  },
  upload: {
    ttl: 60000,
    limit: 5, // 5 uploads per minute
  },
  list: {
    ttl: 60000,
    limit: 30, // 30 list requests per minute
  },
  validate: {
    ttl: 60000,
    limit: 3, // 3 validations per minute (expensive)
  },
  commit: {
    ttl: 60000,
    limit: 2, // 2 commits per minute (very expensive)
  },
};

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: THROTTLER_CONFIG.global.ttl,
        limit: THROTTLER_CONFIG.global.limit,
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class ThrottlerConfigModule {}
