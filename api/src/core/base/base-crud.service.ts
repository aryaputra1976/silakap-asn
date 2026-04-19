import { handlePrismaError } from '../prisma/prisma-error.handler'
import { enforceRetention } from './retention.guard'

export class BaseCrudService {
  /**
   * Wrapper eksekusi aman untuk operasi READ / CREATE
   */
  protected async safeExecute<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      handlePrismaError(error)
    }
  }

  /**
   * Wrapper khusus operasi MUTASI (UPDATE / DELETE)
   * Menambahkan enforcement retention & legal hold
   */
  protected async safeMutate<T>(
    getEntity: () => Promise<any>,
    mutate: () => Promise<T>,
  ): Promise<T> {
    try {
      const entity = await getEntity()

      // 🔒 Enforcement retention global
      enforceRetention(entity)

      return await mutate()
    } catch (error) {
      handlePrismaError(error)
    }
  }
}