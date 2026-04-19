import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { Prisma } from '@prisma/client'

export type AuditPayload = {
  action: string
  entity: string
  entityId?: string | bigint | null
  payload?: unknown
  userId?: bigint | number | null
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async write(payload: AuditPayload) {
    await this.prisma.auditLog.create({
      data: {
        action: payload.action,
        entity: payload.entity,
        entityId:
          payload.entityId !== undefined && payload.entityId !== null
            ? String(payload.entityId)
            : null,

        // ⭐ FIX RESMI PRISMA UNTUK JSON NULL
        payload:
          payload.payload === undefined
            ? undefined
            : payload.payload === null
            ? Prisma.JsonNull
            : payload.payload,

        userId:
          payload.userId !== undefined && payload.userId !== null
            ? (payload.userId as any)
            : null,
      },
    })
  }
}