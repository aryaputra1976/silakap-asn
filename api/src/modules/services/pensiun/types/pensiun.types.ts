import { PrismaClient, Prisma } from "@prisma/client"

export type DBClient =
  | PrismaClient
  | Prisma.TransactionClient

export interface PensiunCreateDetailPayload {
  jenisPensiunId: bigint
  tmtPensiun: Date
  dasarHukum?: string
  keterangan?: string
}