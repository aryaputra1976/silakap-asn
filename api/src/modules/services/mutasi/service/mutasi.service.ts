import { Prisma } from '@prisma/client'
import { ServiceHandler } from '../../registry/services.registry.types'

export class MutasiService implements ServiceHandler {

  async createDetail(
    tx: Prisma.TransactionClient,
    usulId: bigint,
    payload?: unknown
  ) {

    // logic create mutasi detail

  }

}