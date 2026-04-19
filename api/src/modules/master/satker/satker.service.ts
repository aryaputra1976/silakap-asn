import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { BaseMasterService } from '@/modules/master/core/base-master.service'
import {
  SatkerRepository,
  SatkerEntity,
} from './satker.repository'
import { CreateSatkerDto } from './dto/create-satker.dto'
import { UpdateSatkerDto } from './dto/update-satker.dto'
import { QuerySatkerDto } from './dto/query-satker.dto'

@Injectable()
export class SatkerService extends BaseMasterService<
  SatkerEntity,
  CreateSatkerDto,
  UpdateSatkerDto,
  QuerySatkerDto
> {
  constructor(
    protected readonly repo: SatkerRepository,
    protected readonly prisma: PrismaService
  ) {
    super(repo, prisma)
  }

  protected async beforeCreateTx(tx: any, dto: CreateSatkerDto) {
    if (await this.repo.findByKode(dto.kode, tx)) {
      throw new BadRequestException('Kode sudah digunakan')
    }

    if (await this.repo.findByNama(dto.nama, tx)) {
      throw new BadRequestException('Nama sudah digunakan')
    }
  }

  protected async beforeUpdateTx(
    tx: any,
    id: bigint,
    dto: UpdateSatkerDto
  ) {
    if (dto.nama) {
      const existing = await this.repo.findByNama(
        dto.nama,
        tx
      )

      if (existing && existing.id !== id) {
        throw new BadRequestException(
          'Nama sudah digunakan'
        )
      }
    }
  }

  protected async beforeDeleteTx(tx: any, id: bigint) {
    if (await this.repo.isReferenced(id, tx)) {
      throw new BadRequestException(
        'Satker tidak dapat dihapus karena masih digunakan'
      )
    }
  }
}