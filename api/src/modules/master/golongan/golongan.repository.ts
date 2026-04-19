import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BaseMasterRepository,
  MasterEntity,
  TxClient,
} from '@/modules/master/core/base-master.repository'
import { CreateGolonganDto } from './dto/create-golongan.dto'
import { UpdateGolonganDto } from './dto/update-golongan.dto'
import { QueryGolonganDto } from './dto/query-golongan.dto'

export type GolonganEntity = MasterEntity & {
  kode: string
  nama: string
  isActive: boolean
}

@Injectable()
export class GolonganRepository extends BaseMasterRepository<
  GolonganEntity,
  CreateGolonganDto,
  UpdateGolonganDto,
  QueryGolonganDto
> {
  constructor(prisma: PrismaService) {
    super(prisma)
  }

  protected getModelName(): 'refGolongan' {
    return 'refGolongan'
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'kode', 'nama', 'createdAt']
  }

  async findByKode(
    kode: string,
    tx?: TxClient
  ): Promise<GolonganEntity | null> {
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
  ): Promise<GolonganEntity | null> {
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

    // Cek relasi utama
    const pegawaiAktif = await client.silakapPegawai.count({
      where: {
        golonganAktifId: id,
        deletedAt: null,
      },
    })

    const pegawaiAwal = await client.silakapPegawai.count({
      where: {
        golonganAwalId: id,
        deletedAt: null,
      },
    })

    const riwayat = await client.silakapRiwayatPangkat.count({
      where: {
        golonganId: id,
      },
    })

    return pegawaiAktif > 0 || pegawaiAwal > 0 || riwayat > 0
  }
}