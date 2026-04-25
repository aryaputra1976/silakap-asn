import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BaseMasterRepository,
  MasterEntity,
  TxClient,
} from '@/modules/master/core/base-master.repository'
import { CreatePendidikanTingkatDto } from './dto/create-pendidikan-tingkat.dto'
import { UpdatePendidikanTingkatDto } from './dto/update-pendidikan-tingkat.dto'
import { QueryPendidikanTingkatDto } from './dto/query-pendidikan-tingkat.dto'

export type PendidikanTingkatEntity = MasterEntity & {
  kode: string
  nama: string
  isActive: boolean
}

@Injectable()
export class PendidikanTingkatRepository extends BaseMasterRepository<
  PendidikanTingkatEntity,
  CreatePendidikanTingkatDto,
  UpdatePendidikanTingkatDto,
  QueryPendidikanTingkatDto
> {
  constructor(prisma: PrismaService) {
    super(prisma)
  }

  protected getModelName(): 'refPendidikanTingkat' {
    return 'refPendidikanTingkat'
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

    const [pegawai, riwayat, pendidikan] =
        await Promise.all([
        client.silakapPegawai.count({
            where: {
            pendidikanTingkatId: id, // pastikan ini memang field di Pegawai
            deletedAt: null,
            },
        }),
        client.silakapRiwayatPendidikan.count({
            where: {
            pendidikanTingkatId: id,
            },
        }),
        client.refPendidikan.count({
            where: {
            tingkatId: id, // ✅ INI YANG BENAR
            deletedAt: null,
            },
        }),
        ])

    return pegawai > 0 || riwayat > 0 || pendidikan > 0
    }
}
