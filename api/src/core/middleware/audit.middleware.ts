import {
  Injectable,
  NestMiddleware,
} from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now()

    res.on('finish', async () => {
      try {
        if (!req.user) return

        const method = req.method
        const url = req.originalUrl

        // Only log mutating actions
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return

        const duration = Date.now() - start

        await this.prisma.auditLog.create({
          data: {
            action: method,
            entity: url.split('/')[2] ?? 'unknown',
            entityId: req.params?.id ?? null,
            payload: sanitizePayload(req.body),
            userId: BigInt((req.user as any).id),
            createdAt: new Date(),
          },
        })
      } catch (err) {
        console.error('Audit logging failed', err)
      }
    })

    next()
  }
}

function sanitizePayload(payload: any) {
  if (!payload) return null

  const clone = { ...payload }

  delete clone.password
  delete clone.accessToken
  delete clone.refreshToken

  return clone
}