import { Prisma } from '@prisma/client'

export class JabatanSubmitService {
  async execute(_tx: Prisma.TransactionClient, _usulId: bigint): Promise<void> {
    // Placeholder until jabatan detail table/domain is finalized.
  }
}
