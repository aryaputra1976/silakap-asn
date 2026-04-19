import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BaseMasterRepository,
  MasterEntity,
  TxClient,
} from '@/modules/master/core/base-master.repository'
import { CreateJenisPegawaiDto } from './dto/create-jenis-pegawai.dto'
import { UpdateJenisPegawaiDto } from './dto/update-jenis-pegawai.dto'
import { QueryJenisPegawaiDto } from './dto/query-jenis-pegawai.dto'

export type JenisPegawaiEntity = MasterEntity & {
  kode: string
  nama: string
  isActive: boolean
}

@Injectable()
export class JenisPegawaiRepository extends BaseMasterRepository<
  JenisPegawaiEntity,
  CreateJenisPegawaiDto,
  UpdateJenisPegawaiDto,
  QueryJenisPegawaiDto
> {
  constructor(prisma: PrismaService) {
    super(prisma)
  }

  protected getModelName(): 'refJenisPegawai' {
    return 'refJenisPegawai'
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'kode', 'nama', 'createdAt']
  }

  async findByKode(
    kode: string,
    tx?: TxClient
  ): Promise<JenisPegawaiEntity | null> {
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
  ): Promise<JenisPegawaiEntity | null> {
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

    const count = await client.silakapPegawai.count({
      where: {
        jenisPegawaiId: id,
        deletedAt: null,
      },
    })

    return count > 0
  }
}