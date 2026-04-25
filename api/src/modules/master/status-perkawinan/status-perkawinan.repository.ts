import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BaseMasterRepository,
  MasterEntity,
  TxClient,
} from '@/modules/master/core/base-master.repository'
import { CreateStatusPerkawinanDto } from './dto/create-status-perkawinan.dto'
import { UpdateStatusPerkawinanDto } from './dto/update-status-perkawinan.dto'
import { QueryStatusPerkawinanDto } from './dto/query-status-perkawinan.dto'

export type StatusPerkawinanEntity = MasterEntity & {
  kode: string
  nama: string
  isActive: boolean
}

@Injectable()
export class StatusPerkawinanRepository extends BaseMasterRepository<
  StatusPerkawinanEntity,
  CreateStatusPerkawinanDto,
  UpdateStatusPerkawinanDto,
  QueryStatusPerkawinanDto
> {
  constructor(prisma: PrismaService) {
    super(prisma)
  }

  protected getModelName(): 'refStatusPerkawinan' {
    return 'refStatusPerkawinan'
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'kode', 'nama', 'createdAt']
  }

  async findByKode(
    kode: string,
    tx?: TxClient
  ): Promise<StatusPerkawinanEntity | null> {
    const model = this.getModel(this.getClient(tx))

    return model.findFirst({
      where: {
        kode: { equals: kode },
        deletedAt: null,
      },
    })
  }

  async findByNama(
    nama: string,
    tx?: TxClient
  ): Promise<StatusPerkawinanEntity | null> {
    const model = this.getModel(this.getClient(tx))

    return model.findFirst({
      where: {
        nama: { equals: nama },
        deletedAt: null,
      },
    })
  }

  async isReferenced(
    id: bigint,
    tx?: TxClient
  ): Promise<boolean> {
    const client = this.getClient(tx)

    const count = await client.silakapPegawai.count({
      where: {
        statusPerkawinanId: id,
        deletedAt: null,
      },
    })

    return count > 0
  }
}
