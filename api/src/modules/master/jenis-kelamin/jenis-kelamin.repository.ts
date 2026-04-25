import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BaseMasterRepository,
  MasterEntity,
  TxClient,
} from '@/modules/master/core/base-master.repository'
import { CreateJenisKelaminDto } from './dto/create-jenis-kelamin.dto'
import { UpdateJenisKelaminDto } from './dto/update-jenis-kelamin.dto'
import { QueryJenisKelaminDto } from './dto/query-jenis-kelamin.dto'

export type JenisKelaminEntity = MasterEntity & {
  kode: string
  nama: string
  isActive: boolean
}

@Injectable()
export class JenisKelaminRepository extends BaseMasterRepository<
  JenisKelaminEntity,
  CreateJenisKelaminDto,
  UpdateJenisKelaminDto,
  QueryJenisKelaminDto
> {
  constructor(prisma: PrismaService) {
    super(prisma)
  }

  protected getModelName(): 'refJenisKelamin' {
    return 'refJenisKelamin'
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'kode', 'nama', 'createdAt']
  }

  async findByKode(
    kode: string,
    tx?: TxClient
  ): Promise<JenisKelaminEntity | null> {
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
  ): Promise<JenisKelaminEntity | null> {
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
        jenisKelaminId: id,
        deletedAt: null,
      },
    })

    return count > 0
  }
}
