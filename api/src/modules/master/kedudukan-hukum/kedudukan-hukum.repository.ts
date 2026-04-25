import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BaseMasterRepository,
  MasterEntity,
  TxClient,
} from '@/modules/master/core/base-master.repository'
import { CreateKedudukanHukumDto } from './dto/create-kedudukan-hukum.dto'
import { UpdateKedudukanHukumDto } from './dto/update-kedudukan-hukum.dto'
import { QueryKedudukanHukumDto } from './dto/query-kedudukan-hukum.dto'

export type KedudukanHukumEntity = MasterEntity & {
  kode: string
  nama: string
  isActive: boolean
}

@Injectable()
export class KedudukanHukumRepository extends BaseMasterRepository<
  KedudukanHukumEntity,
  CreateKedudukanHukumDto,
  UpdateKedudukanHukumDto,
  QueryKedudukanHukumDto
> {
  constructor(prisma: PrismaService) {
    super(prisma)
  }

  protected getModelName(): 'refKedudukanHukum' {
    return 'refKedudukanHukum'
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
        kedudukanHukumId: id,
        deletedAt: null,
      },
    })

    return count > 0
  }
}
