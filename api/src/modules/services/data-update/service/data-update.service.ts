import { Prisma } from '@prisma/client'
import { ServiceHandler } from '../../registry/services.registry.types'

export class DataUpdateService implements ServiceHandler {

  async createDetail(
    tx: Prisma.TransactionClient,
    usulId: bigint,
    payload?: unknown
  ): Promise<void> {

    // sementara kosong
    // nanti bisa simpan detail perubahan data pegawai

  }

}