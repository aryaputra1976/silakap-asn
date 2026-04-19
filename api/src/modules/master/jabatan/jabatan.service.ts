import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { BaseMasterService } from '@/modules/master/core/base-master.service'
import {
  JabatanRepository,
  JabatanEntity,
} from './jabatan.repository'
import { CreateJabatanDto } from './dto/create-jabatan.dto'
import { UpdateJabatanDto } from './dto/update-jabatan.dto'
import { QueryJabatanDto } from './dto/query-jabatan.dto'

@Injectable()
export class JabatanService extends BaseMasterService<
  JabatanEntity,
  CreateJabatanDto,
  UpdateJabatanDto,
  QueryJabatanDto
> {
  constructor(
    protected readonly repo: JabatanRepository,
    protected readonly prisma: PrismaService
  ) {
    super(repo, prisma)
  }

  protected async beforeCreateTx(tx: any, dto: CreateJabatanDto) {
    if (await this.repo.findByKode(dto.kode, tx)) {
      throw new BadRequestException('Kode sudah digunakan')
    }

    if (await this.repo.findByNama(dto.nama, tx)) {
      throw new BadRequestException('Nama sudah digunakan')
    }

    if (dto.jenisJabatanId) {
      const exists = await this.repo.jenisExists(
        BigInt(dto.jenisJabatanId),
        tx
      )

      if (!exists) {
        throw new BadRequestException(
          'Jenis Jabatan tidak ditemukan'
        )
      }
    }
  }

  protected async beforeUpdateTx(
    tx: any,
    id: bigint,
    dto: UpdateJabatanDto
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

    if (dto.jenisJabatanId) {
      const exists = await this.repo.jenisExists(
        BigInt(dto.jenisJabatanId),
        tx
      )

      if (!exists) {
        throw new BadRequestException(
          'Jenis Jabatan tidak ditemukan'
        )
      }
    }
  }

  protected async beforeDeleteTx(tx: any, id: bigint) {
    if (await this.repo.isReferenced(id, tx)) {
      throw new BadRequestException(
        'Jabatan masih digunakan'
      )
    }
  }
}