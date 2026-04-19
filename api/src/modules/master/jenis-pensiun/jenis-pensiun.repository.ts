import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BaseMasterRepository,
  MasterEntity,
  TxClient,
} from '@/modules/master/core/base-master.repository'
import { CreateJenisPensiunDto } from './dto/create-jenis-pensiun.dto'
import { UpdateJenisPensiunDto } from './dto/update-jenis-pensiun.dto'
import { QueryJenisPensiunDto } from './dto/query-jenis-pensiun.dto'

export type JenisPensiunEntity = MasterEntity & {
  kode: string
  nama: string
  isActive: boolean
}

@Injectable()
export class JenisPensiunRepository extends BaseMasterRepository<
  JenisPensiunEntity,
  CreateJenisPensiunDto,
  UpdateJenisPensiunDto,
  QueryJenisPensiunDto
> {
  constructor(prisma: PrismaService) {
    super(prisma)
  }

  protected getModelName(): 'refJenisPensiun' {
    return 'refJenisPensiun'
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'kode', 'nama', 'createdAt']
  }

  async findByKode(
    kode: string,
    tx?: TxClient
  ): Promise<JenisPensiunEntity | null> {
    const model = this.getModel(this.getClient(tx))

    return model.findFirst({
      where: {
        kode: { equals: kode, mode: 'insensitive' },
        deletedAt: null,
      },
    })
  }

  async findByNama(
    nama: string,
    tx?: TxClient
  ): Promise<JenisPensiunEntity | null> {
    const model = this.getModel(this.getClient(tx))

    return model.findFirst({
      where: {
        nama: { equals: nama, mode: 'insensitive' },
        deletedAt: null,
      },
    })
  }

  async isReferenced(
    id: bigint,
    tx?: TxClient
  ): Promise<boolean> {
    const client = this.getClient(tx)

    const count = await client.silakapPensiunDetail.count({
      where: {
        jenisPensiunId: id,
        deletedAt: null,
      },
    })

    return count > 0
  }
}