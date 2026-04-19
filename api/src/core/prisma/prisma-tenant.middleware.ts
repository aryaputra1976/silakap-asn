import { Prisma } from '@prisma/client'
import { getTenantId } from '../../core/tenant/tenant-context'

export async function prismaTenantMiddleware(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  const tenantId = getTenantId()

  if (!tenantId) {
    return next(params)
  }

  const readActions = ['findMany', 'findFirst', 'count', 'aggregate', 'groupBy']
  const writeActions = ['update', 'updateMany', 'delete', 'deleteMany', 'upsert']

  if (readActions.includes(params.action) || writeActions.includes(params.action)) {
    params.args = params.args || {}
    params.args.where = params.args.where || {}
    params.args.where.tenant_id = tenantId
  }

  if (params.action === 'create') {
    params.args.data = {
      ...params.args.data,
      tenant_id: tenantId,
    }
  }

  if (params.action === 'createMany') {
    params.args.data = params.args.data.map((item: any) => ({
      ...item,
      tenant_id: tenantId,
    }))
  }

  return next(params)
}
