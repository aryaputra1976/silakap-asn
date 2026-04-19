import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BaseMasterRepository,
  MasterEntity,
  TxClient,
} from '@/modules/master/core/base-master.repository'
import { CreateSatkerDto } from './dto/create-satker.dto'
import { UpdateSatkerDto } from './dto/update-satker.dto'
import { QuerySatkerDto } from './dto/query-satker.dto'

export type SatkerEntity = MasterEntity & {
  kode: string
  nama: string
  isActive: boolean
}

@Injectable()
export class SatkerRepository extends BaseMasterRepository<
  SatkerEntity,
  CreateSatkerDto,
  UpdateSatkerDto,
  QuerySatkerDto
> {
  constructor(prisma: PrismaService) {
    super(prisma)
  }

  protected getModelName(): 'refSatker' {
    return 'refSatker'
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

    const [pegawaiInduk, pegawaiKerja, riwayat] =
      await Promise.all([
        client.silakapPegawai.count({
          where: {
            satkerIndukId: id,
            deletedAt: null,
          },
        }),
        client.silakapPegawai.count({
          where: {
            satkerKerjaId: id,
            deletedAt: null,
          },
        }),
        client.silakapRiwayatJabatan.count({
          where: {
            satkerId: id,
          },
        }),
      ])

    return (
      pegawaiInduk > 0 ||
      pegawaiKerja > 0 ||
      riwayat > 0
    )
  }
}