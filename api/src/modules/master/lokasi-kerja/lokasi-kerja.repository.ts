import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BaseMasterRepository,
  MasterEntity,
  TxClient,
} from '@/modules/master/core/base-master.repository'
import { CreateLokasiKerjaDto } from './dto/create-lokasi-kerja.dto'
import { UpdateLokasiKerjaDto } from './dto/update-lokasi-kerja.dto'
import { QueryLokasiKerjaDto } from './dto/query-lokasi-kerja.dto'

export type LokasiKerjaEntity = MasterEntity & {
  kode: string
  nama: string
  isActive: boolean
}

@Injectable()
export class LokasiKerjaRepository extends BaseMasterRepository<
  LokasiKerjaEntity,
  CreateLokasiKerjaDto,
  UpdateLokasiKerjaDto,
  QueryLokasiKerjaDto
> {
  constructor(prisma: PrismaService) {
    super(prisma)
  }

  protected getModelName(): 'refLokasiKerja' {
    return 'refLokasiKerja'
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

    const [pegawaiCount, riwayatCount] =
      await Promise.all([
        client.silakapPegawai.count({
          where: {
            lokasiKerjaId: id,
            deletedAt: null,
          },
        }),
        client.silakapRiwayatJabatan.count({
          where: {
            lokasiKerjaId: id,
          },
        }),
      ])

    return pegawaiCount > 0 || riwayatCount > 0
  }
}