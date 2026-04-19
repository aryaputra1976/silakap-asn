import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BaseMasterRepository,
  MasterEntity,
  TxClient,
} from '@/modules/master/core/base-master.repository'
import { CreateJabatanDto } from './dto/create-jabatan.dto'
import { UpdateJabatanDto } from './dto/update-jabatan.dto'
import { QueryJabatanDto } from './dto/query-jabatan.dto'

export type JabatanEntity = MasterEntity & {
  kode: string
  nama: string
  jenisJabatanId?: bigint | null
  isActive: boolean
}

@Injectable()
export class JabatanRepository extends BaseMasterRepository<
  JabatanEntity,
  CreateJabatanDto,
  UpdateJabatanDto,
  QueryJabatanDto
> {
  constructor(prisma: PrismaService) {
    super(prisma)
  }

  protected getModelName(): 'refJabatan' {
    return 'refJabatan'
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

  async jenisExists(id: bigint, tx?: TxClient): Promise<boolean> {
    const client = this.getClient(tx)

    const existing =
      await client.refJenisJabatan.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      })

    return !!existing
  }

  async isReferenced(id: bigint, tx?: TxClient): Promise<boolean> {
    const client = this.getClient(tx)

    const [pegawai, riwayat] = await Promise.all([
      client.silakapPegawai.count({
        where: {
          jabatanId: id,
          deletedAt: null,
        },
      }),
      client.silakapRiwayatJabatan.count({
        where: {
          jabatanId: id,
        },
      }),
    ])

    return pegawai > 0 || riwayat > 0
  }
}