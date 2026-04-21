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
    const publicPaths = new Set([
      '/docs',
      '/docs-json',
      '/health',
      '/auth/login',
      '/auth/refresh',
      '/auth/logout',
      '/auth/register',
      '/auth/register/pegawai',
      '/ref/unor/level2',
      '/ref/unor/register-options',
    ])

    const url = req.originalUrl || req.url
    const normalizedUrl = url.startsWith('/api/')
      ? url.replace(/^\/api/, '')
      : url
    const isPublic = [...publicPaths].some((p) =>
      normalizedUrl.startsWith(p),
    )

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
