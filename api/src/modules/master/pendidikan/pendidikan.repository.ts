import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BaseMasterRepository,
  MasterEntity,
  TxClient,
} from '@/modules/master/core/base-master.repository'
import { CreatePendidikanDto } from './dto/create-pendidikan.dto'
import { UpdatePendidikanDto } from './dto/update-pendidikan.dto'
import { QueryPendidikanDto } from './dto/query-pendidikan.dto'

export type PendidikanEntity = MasterEntity & {
  kode: string
  nama: string
  tingkatId?: bigint | null
}

@Injectable()
export class PendidikanRepository extends BaseMasterRepository<
  PendidikanEntity,
  CreatePendidikanDto,
  UpdatePendidikanDto,
  QueryPendidikanDto
> {
  constructor(prisma: PrismaService) {
    super(prisma)
  }

  protected getModelName(): 'refPendidikan' {
    return 'refPendidikan'
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

    const [pegawai, riwayat] = await Promise.all([
      client.silakapPegawai.count({
        where: {
          pendidikanId: id,
          deletedAt: null,
        },
      }),
      client.silakapRiwayatPendidikan.count({
        where: {
          pendidikanId: id,
        },
      }),
    ])

    return pegawai > 0 || riwayat > 0
  }

  async tingkatExists(
    tingkatId: bigint,
    tx?: TxClient
  ): Promise<boolean> {
    const client = this.getClient(tx)

    const existing =
      await client.refPendidikanTingkat.findFirst({
        where: {
          id: tingkatId,
          deletedAt: null,
        },
      })

    return !!existing
  }
}