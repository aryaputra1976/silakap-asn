import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

import { prismaTenantMiddleware } from '../core/prisma/prisma-tenant.middleware'
import { prismaAuditMiddleware } from '../core/prisma/prisma-audit.middleware'

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
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}