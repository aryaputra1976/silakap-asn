import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BaseMasterRepository,
  MasterEntity,
  TxClient,
} from '@/modules/master/core/base-master.repository'
import { CreateAlasanPensiunDto } from './dto/create-alasan-pensiun.dto'
import { UpdateAlasanPensiunDto } from './dto/update-alasan-pensiun.dto'
import { QueryAlasanPensiunDto } from './dto/query-alasan-pensiun.dto'

export type AlasanPensiunEntity = MasterEntity & {
  kode: string
  nama: string
  isActive: boolean
}

@Injectable()
export class AlasanPensiunRepository extends BaseMasterRepository<
  AlasanPensiunEntity,
  CreateAlasanPensiunDto,
  UpdateAlasanPensiunDto,
  QueryAlasanPensiunDto
> {
  constructor(prisma: PrismaService) {
    super(prisma)
  }

  protected getModelName(): 'refAlasanPensiun' {
    return 'refAlasanPensiun'
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'kode', 'nama', 'createdAt']
  }

  async findByKode(
    kode: string,
    tx?: TxClient
  ): Promise<AlasanPensiunEntity | null> {
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
  ): Promise<AlasanPensiunEntity | null> {
    const model = this.getModel(this.getClient(tx))

    return model.findFirst({
      where: {
        nama: { equals: nama, mode: 'insensitive' },
        deletedAt: null,
      },
    })
  }
}