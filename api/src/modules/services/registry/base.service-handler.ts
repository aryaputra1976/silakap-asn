import { Prisma } from '@prisma/client'

export abstract class BaseServiceHandler {

  async createDetail(
    tx: Prisma.TransactionClient,
    usulId: bigint
  ) {}

  async validateSubmit(
    tx: Prisma.TransactionClient,
    usulId: bigint
  ) {}

  async afterSubmit(
    tx: Prisma.TransactionClient,
    usulId: bigint
  ) {}

  async afterTransition(
    tx: Prisma.TransactionClient,
    usulId: bigint,
    actionCode: string
  ) {}

}