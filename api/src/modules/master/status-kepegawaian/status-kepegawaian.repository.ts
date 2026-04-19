import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  BaseMasterRepository,
  MasterEntity,
  TxClient,
} from '@/modules/master/core/base-master.repository'
import { CreateStatusKepegawaianDto } from './dto/create-status-kepegawaian.dto'
import { UpdateStatusKepegawaianDto } from './dto/update-status-kepegawaian.dto'
import { QueryStatusKepegawaianDto } from './dto/query-status-kepegawaian.dto'

export type StatusKepegawaianEntity = MasterEntity & {
  kode: string
  nama: string
  isActive: boolean
}

@Injectable()
export class StatusKepegawaianRepository extends BaseMasterRepository<
  StatusKepegawaianEntity,
  CreateStatusKepegawaianDto,
  UpdateStatusKepegawaianDto,
  QueryStatusKepegawaianDto
> {
  constructor(prisma: PrismaService) {
    super(prisma)
  }

  protected getModelName(): 'refStatusKepegawaian' {
    return 'refStatusKepegawaian'
  }

  protected getAllowedSortFields(): string[] {
    return ['id', 'kode', 'nama', 'createdAt']
  }

  async findByKode(
    kode: string,
    tx?: TxClient
  ): Promise<StatusKepegawaianEntity | null> {
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
  ): Promise<StatusKepegawaianEntity | null> {
    const model = this.getModel(this.getClient(tx))

    return model.findFirst({
      where: {
        nama: { equals: nama, mode: 'insensitive' },
        deletedAt: null,
      },
    })
  }
}