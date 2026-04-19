import { Prisma } from '@prisma/client'
import { ServiceHandler } from '../../registry/services.registry.types'

export class KgbService implements ServiceHandler {

  async createDetail(
    tx: Prisma.TransactionClient,
    usulId: bigint
  ) {

    // logic KGB

  }

}