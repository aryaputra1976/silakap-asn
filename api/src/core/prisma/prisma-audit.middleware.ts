import { Prisma } from '@prisma/client'
import { AsyncLocalStorage } from 'async_hooks'
import { getTenantId } from '../../core/tenant/tenant-context'
import { AuditQueue } from '../../core/queue/audit.queue'

type AuditContext = {
  userId?: string
  ip?: string
  userAgent?: string
}

const auditStorage = new AsyncLocalStorage<AuditContext>()

export const setAuditContext = (ctx: AuditContext) => {
  auditStorage.enterWith(ctx)
}

export const prismaAuditMiddleware: Prisma.Middleware = async (params, next) => {
  const ctx = auditStorage.getStore()
  const tenantId = getTenantId()

  const mutatingActions = ['create', 'update', 'delete']
  if (!mutatingActions.includes(params.action)) {
    return next(params)
  }

  // ================= BEFORE (safe) =================
  let before: any = null

  if (params.action !== 'create' && params.args?.where) {
    try {
      before = await next({
        ...params,
        action: 'findUnique',
        args: { where: params.args.where }, // ⬅️ penting: buang `data`
      })
    } catch {
      // ignore
    }
  }

  // ================= EXECUTE =================
  const result = await next(params)

  // ================= AFTER =================
  const after = result

  // ================= AUDIT QUEUE =================
  if (ctx) {
    try {
      const queue = new AuditQueue((global as any).queueService)

      await queue.log({
        tenantId,
        userId: ctx.userId,
        action: `${params.model}.${params.action}`,
        before,
        after,
        ip: ctx.ip,
        userAgent: ctx.userAgent,
        timestamp: new Date(),
      })
    } catch {
      // jangan ganggu transaksi utama
    }
  }

  return result
}