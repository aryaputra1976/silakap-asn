import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BaseMasterRepository,
  MasterEntity,
  TxClient,
} from '@/modules/master/core/base-master.repository'
import { CreateTempatLahirDto } from './dto/create-tempat-lahir.dto'
import { UpdateTempatLahirDto } from './dto/update-tempat-lahir.dto'
import { QueryTempatLahirDto } from './dto/query-tempat-lahir.dto'

export type TempatLahirEntity = MasterEntity & {
  kode: string
  nama: string
  isActive: boolean
}

@Injectable()
export class TempatLahirRepository extends BaseMasterRepository<
  TempatLahirEntity,
  CreateTempatLahirDto,
  UpdateTempatLahirDto,
  QueryTempatLahirDto
> {
  constructor(prisma: PrismaService) {
    super(prisma)
  }

  protected getModelName(): 'refTempatLahir' {
    return 'refTempatLahir'
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'kode', 'nama', 'createdAt']
  }

  async findByKode(kode: string, tx?: TxClient) {
    const model = this.getModel(this.getClient(tx))
    return model.findFirst({
      where: {
        kode: { equals: kode, mode: 'insensitive' },
        deletedAt: null,
      },
    })
  }

  async findByNama(nama: string, tx?: TxClient) {
    const model = this.getModel(this.getClient(tx))
    return model.findFirst({
      where: {
        nama: { equals: nama, mode: 'insensitive' },
        deletedAt: null,
      },
    })
  }

  async isReferenced(id: bigint, tx?: TxClient): Promise<boolean> {
    const client = this.getClient(tx)

    const count = await client.silakapPegawai.count({
      where: {
        tempatLahirId: id,
        deletedAt: null,
      },
    })

    return count > 0
  }
}