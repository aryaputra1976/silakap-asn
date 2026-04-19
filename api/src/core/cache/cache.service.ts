import { Injectable } from '@nestjs/common'
import { RedisService } from '../../core/redis/redis.service'

@Injectable()
export class CacheService {
  constructor(private readonly redis: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }

  async set(key: string, value: any, ttlSeconds = 60) {
    const safe = JSON.parse(
      JSON.stringify(value, (_, v) =>
        typeof v === 'bigint' ? Number(v) : v,
      ),
    )

    await this.redis.set(
      key,
      JSON.stringify(safe),
      'EX',
      ttlSeconds,
    )
  }

  async del(key: string) {
    await this.redis.del(key)
  }

  async delByPattern(pattern: string) {
    let cursor = '0'

    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      )

      cursor = nextCursor

      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } while (cursor !== '0')
  }
}
