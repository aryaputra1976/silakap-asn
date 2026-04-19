import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BaseMasterRepository,
  MasterEntity,
  TxClient,
} from '@/modules/master/core/base-master.repository'
import { CreateInstansiDto } from './dto/create-instansi.dto'
import { UpdateInstansiDto } from './dto/update-instansi.dto'
import { QueryInstansiDto } from './dto/query-instansi.dto'

export type InstansiEntity = MasterEntity & {
  kode: string
  nama: string
  isActive: boolean
}

@Injectable()
export class InstansiRepository extends BaseMasterRepository<
  InstansiEntity,
  CreateInstansiDto,
  UpdateInstansiDto,
  QueryInstansiDto
> {
  constructor(prisma: PrismaService) {
    super(prisma)
  }

  protected getModelName(): 'refInstansi' {
    return 'refInstansi'
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

    const [pegawaiInduk, pegawaiKerja, riwayat] = await Promise.all([
      client.silakapPegawai.count({
        where: {
          instansiIndukId: id,
          deletedAt: null, // ✅ karena Pegawai punya deletedAt
        },
      }),
      client.silakapPegawai.count({
        where: {
          instansiKerjaId: id,
          deletedAt: null, // ✅ karena Pegawai punya deletedAt
        },
      }),
      client.silakapRiwayatJabatan.count({
        where: {
          instansiId: id, // ✅ TANPA deletedAt
        },
      }),
    ])

    return pegawaiInduk > 0 || pegawaiKerja > 0 || riwayat > 0
  }
}