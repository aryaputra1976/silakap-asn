import { DynamicModule, Global, Module } from '@nestjs/common'
import { RedisService } from './redis.service'
import { MockRedisService } from './redis.mock'

@Global()
@Module({})
export class RedisModule {
  static register(): DynamicModule {
    const isEnabled = process.env.REDIS_ENABLED === 'true'

    return {
      module: RedisModule,
      providers: [
        {
          provide: RedisService,
          useClass: isEnabled ? RedisService : MockRedisService,
        },
      ],
      exports: [RedisService],
    }
  }
}