import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { BaseMasterService } from '@/modules/master/core/base-master.service'
import {
  JenisJabatanRepository,
  JenisJabatanEntity,
} from './jenis-jabatan.repository'
import { CreateJenisJabatanDto } from './dto/create-jenis-jabatan.dto'
import { UpdateJenisJabatanDto } from './dto/update-jenis-jabatan.dto'
import { QueryJenisJabatanDto } from './dto/query-jenis-jabatan.dto'

@Injectable()
export class JenisJabatanService extends BaseMasterService<
  JenisJabatanEntity,
  CreateJenisJabatanDto,
  UpdateJenisJabatanDto,
  QueryJenisJabatanDto
> {
  constructor(
    protected readonly repo: JenisJabatanRepository,
    protected readonly prisma: PrismaService
  ) {
    super(repo, prisma)
  }

  protected async beforeCreateTx(tx: any, dto: CreateJenisJabatanDto) {
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
    dto: UpdateJenisJabatanDto
  ) {
    if (dto.nama) {
      const existing = await this.repo.findByNama(dto.nama, tx)

      if (existing && existing.id !== id) {
        throw new BadRequestException('Nama sudah digunakan')
      }
    }
  }

  protected async beforeDeleteTx(tx: any, id: bigint) {
    if (await this.repo.isReferenced(id, tx)) {
      throw new BadRequestException(
        'Jenis Jabatan masih digunakan'
      )
    }
  }
}