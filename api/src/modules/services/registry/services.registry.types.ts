import { Prisma } from '@prisma/client'

export interface ServiceHandler {

  /**
   * dipanggil saat create usul
   */
  createDetail?(
    tx: Prisma.TransactionClient,
    usulId: bigint,
    payload?: unknown
  ): Promise<void>

  /**
   * validasi sebelum submit
   */
  validateSubmit?(
    tx: Prisma.TransactionClient,
    usulId: bigint
  ): Promise<void>

  /**
   * hook setelah submit
   */
  afterSubmit?(
    tx: Prisma.TransactionClient,
    usulId: bigint
  ): Promise<void>

  /**
   * hook setelah workflow transition
   */
  afterTransition?(
    tx: Prisma.TransactionClient,
    usulId: bigint,
    actionCode: string
  ): Promise<void>

}

