import { AsyncLocalStorage } from 'async_hooks'

type TenantStore = {
  tenantId: string
}

export const tenantStorage = new AsyncLocalStorage<TenantStore>()

export const getTenantId = (): string | undefined => {
  return tenantStorage.getStore()?.tenantId
}