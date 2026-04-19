import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { BaseMasterService } from '@/modules/master/core/base-master.service'
import {
  JenisLayananRepository,
  JenisLayananEntity,
} from './jenis-layanan.repository'
import { CreateJenisLayananDto } from './dto/create-jenis-layanan.dto'
import { UpdateJenisLayananDto } from './dto/update-jenis-layanan.dto'
import { QueryJenisLayananDto } from './dto/query-jenis-layanan.dto'

@Injectable()
export class JenisLayananService extends BaseMasterService<
  JenisLayananEntity,
  CreateJenisLayananDto,
  UpdateJenisLayananDto,
  QueryJenisLayananDto
> {
  constructor(
    protected readonly repo: JenisLayananRepository,
    protected readonly prisma: PrismaService
  ) {
    super(repo, prisma)
  }

  protected async beforeCreateTx(tx: any, dto: CreateJenisLayananDto) {
    if (await this.repo.findByKode(dto.kode, tx)) {
      throw new BadRequestException('Kode sudah digunakan')
    }

    if (await this.repo.findByNama(dto.nama, tx)) {
      throw new BadRequestException('Nama sudah digunakan')
    }
  }

  protected async beforeDeleteTx(tx: any, id: bigint) {
    if (await this.repo.isReferenced(id, tx)) {
      throw new BadRequestException(
        'Jenis Layanan tidak dapat dihapus karena masih digunakan dalam sistem workflow'
      )
    }
  }
}