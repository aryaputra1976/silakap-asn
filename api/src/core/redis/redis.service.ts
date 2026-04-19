import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class RedisService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RedisService.name)
  private readonly enabled =
    process.env.REDIS_ENABLED === 'true'
  private readonly client: Redis

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      enableReadyCheck: false,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    })

    this.client.on('connect', () => {
      this.logger.log('Redis connected')
    })

    this.client.on('error', (err) => {
      this.logger.error('Redis error', err?.message)
    })
  }

  async onModuleInit() {
    try {
      await this.client.ping()
      this.logger.log('Redis ready')
    } catch (err) {
      this.logger.error('Redis ping failed')
      if (this.enabled) {
        throw err
      }
    }
  }

  getClient(): Redis {
    return this.client
  }

  isEnabled(): boolean {
    return this.enabled
  }

  async ping(): Promise<string> {
    return this.client.ping()
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  async set(
    key: string,
    value: string,
    mode?: 'EX',
    ttlSeconds?: number,
  ) {
    if (mode && ttlSeconds) {
      return this.client.set(key, value, mode, ttlSeconds)
    }

    return this.client.set(key, value)
  }

  async del(...keys: string[]) {
    return this.client.del(...keys)
  }

  async scan(
    cursor: string,
    matchLiteral: 'MATCH',
    pattern: string,
    countLiteral: 'COUNT',
    count: number,
  ) {
    return this.client.scan(
      cursor,
      matchLiteral,
      pattern,
      countLiteral,
      count,
    )
  }

  async onModuleDestroy() {
    await this.client.quit()
  }
}
