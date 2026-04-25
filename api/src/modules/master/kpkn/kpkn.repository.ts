import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BaseMasterRepository,
  MasterEntity,
  TxClient,
} from '@/modules/master/core/base-master.repository'
import { CreateKpknDto } from './dto/create-kpkn.dto'
import { UpdateKpknDto } from './dto/update-kpkn.dto'
import { QueryKpknDto } from './dto/query-kpkn.dto'

export type KpknEntity = MasterEntity & {
  kode: string
  nama: string
  isActive: boolean
}

@Injectable()
export class KpknRepository extends BaseMasterRepository<
  KpknEntity,
  CreateKpknDto,
  UpdateKpknDto,
  QueryKpknDto
> {
  constructor(prisma: PrismaService) {
    super(prisma)
  }

  protected getModelName(): 'refKpkn' {
    return 'refKpkn'
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'kode', 'nama', 'createdAt']
  }

  async findByKode(kode: string, tx?: TxClient) {
    const model = this.getModel(this.getClient(tx))
    return model.findFirst({
      where: {
        kode: { equals: kode },
        deletedAt: null,
      },
    })
  }

  async findByNama(nama: string, tx?: TxClient) {
    const model = this.getModel(this.getClient(tx))
    return model.findFirst({
      where: {
        nama: { equals: nama },
        deletedAt: null,
      },
    })
  }

  async isReferenced(id: bigint, tx?: TxClient): Promise<boolean> {
    const client = this.getClient(tx)

    const count = await client.silakapPegawai.count({
      where: {
        kpknId: id,
        deletedAt: null,
      },
    })

    return count > 0
  }
}
