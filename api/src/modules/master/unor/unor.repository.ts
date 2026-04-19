import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BaseMasterRepository,
  MasterEntity,
  TxClient,
} from '@/modules/master/core/base-master.repository'
import { CreateUnorDto } from './dto/create-unor.dto'
import { UpdateUnorDto } from './dto/update-unor.dto'
import { QueryUnorDto } from './dto/query-unor.dto'

export type UnorEntity = MasterEntity & {
  kode: string
  nama: string
  isActive: boolean
}

@Injectable()
export class UnorRepository extends BaseMasterRepository<
  UnorEntity,
  CreateUnorDto,
  UpdateUnorDto,
  QueryUnorDto
> {
  constructor(prisma: PrismaService) {
    super(prisma)
  }

  protected getModelName(): 'refUnor' {
    return 'refUnor'
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

    const [pegawaiUnor, pegawaiUnorInduk, riwayat] =
      await Promise.all([
        client.silakapPegawai.count({
          where: {
            unorId: id,
            deletedAt: null,
          },
        }),
        client.silakapPegawai.count({
          where: {
            unorIndukId: id,
            deletedAt: null,
          },
        }),
        client.silakapRiwayatJabatan.count({
          where: {
            unorId: id,
          },
        }),
      ])

    return (
      pegawaiUnor > 0 ||
      pegawaiUnorInduk > 0 ||
      riwayat > 0
    )
  }
}