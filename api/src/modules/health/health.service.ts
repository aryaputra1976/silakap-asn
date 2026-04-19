import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { RedisService } from '@/core/redis/redis.service'

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getStatus() {
    const startedAt = new Date(
      Date.now() - Math.round(process.uptime() * 1000),
    )

    const checks = await Promise.allSettled([
      this.prisma.$queryRaw`SELECT 1`,
      this.redis.ping(),
    ])

    const databaseOk = checks[0].status === 'fulfilled'
    const redisOk = checks[1].status === 'fulfilled'

    return {
      status: databaseOk && redisOk ? 'ok' : 'degraded',
      app: process.env.APP_NAME ?? 'SILAKAP API',
      env: process.env.APP_ENV ?? 'development',
      uptimeSeconds: Math.round(process.uptime()),
      startedAt: startedAt.toISOString(),
      timestamp: new Date().toISOString(),
      checks: {
        database: databaseOk ? 'ok' : 'error',
        redis: redisOk ? 'ok' : 'error',
      },
    }
  }
}
