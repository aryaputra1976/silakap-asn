import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

import { prismaTenantMiddleware } from '../core/prisma/prisma-tenant.middleware'
import { prismaAuditMiddleware } from '../core/prisma/prisma-audit.middleware'

function parseDatabaseTarget(databaseUrl?: string) {
  if (!databaseUrl) {
    return null
  }

  try {
    const parsed = new URL(databaseUrl)

    return {
      protocol: parsed.protocol.replace(':', ''),
      host: parsed.hostname || null,
      port: parsed.port || null,
      database: parsed.pathname.replace(/^\//, '') || null,
      username: parsed.username || null,
    }
  } catch {
    return null
  }
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'production'
          ? ['warn', 'error']
          : ['query', 'info', 'warn', 'error'],
    })

    // Row-level tenant security
// Row-level tenant security (only if multi-tenant)
    if (process.env.SINGLE_TENANT !== 'true') {
      this.$use(prismaTenantMiddleware)
    }
    // Forensic audit trail
    this.$use(prismaAuditMiddleware)
  }

  async onModuleInit() {
    const databaseTarget = parseDatabaseTarget(process.env.DATABASE_URL)

    console.log('[Prisma] Startup target', {
      protocol: databaseTarget?.protocol ?? null,
      host: databaseTarget?.host ?? null,
      port: databaseTarget?.port ?? null,
      database: databaseTarget?.database ?? null,
      username: databaseTarget?.username ?? null,
      singleTenant: process.env.SINGLE_TENANT ?? null,
      appEnv: process.env.APP_ENV ?? process.env.NODE_ENV ?? null,
    })

    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
