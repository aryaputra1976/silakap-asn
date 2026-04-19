import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { tenantStorage } from '../../core/tenant/tenant-context'

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const publicPaths = [
      '/docs',
      '/docs-json',
      '/health',
      '/api/auth/login',
      '/api/auth/refresh',
    ]

    const url = req.originalUrl || req.url
    const isPublic = publicPaths.some((p) => url.startsWith(p))

    if (isPublic) {
      return next()
    }

    const resolveTenant = (): string => {
      // SINGLE TENANT MODE
      if (process.env.SINGLE_TENANT === 'true') {
        return process.env.DEFAULT_TENANT ?? 'kabupaten'
      }

      // MULTI TENANT MODE
      const tenantId = req.headers['x-tenant-id']

      if (!tenantId || typeof tenantId !== 'string') {
        throw new UnauthorizedException('Tenant not resolved')
      }

      return tenantId
    }

    const tenantId = resolveTenant()

    // ⭐ CRITICAL: wrap request context
    tenantStorage.run({ tenantId }, () => {
      next()
    })
  }
}