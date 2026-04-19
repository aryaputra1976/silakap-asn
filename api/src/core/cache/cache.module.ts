import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}

