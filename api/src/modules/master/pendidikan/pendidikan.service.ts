import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { BaseMasterService } from '@/modules/master/core/base-master.service'
import {
  PendidikanRepository,
  PendidikanEntity,
} from './pendidikan.repository'
import { CreatePendidikanDto } from './dto/create-pendidikan.dto'
import { UpdatePendidikanDto } from './dto/update-pendidikan.dto'
import { QueryPendidikanDto } from './dto/query-pendidikan.dto'

@Injectable()
export class PendidikanService extends BaseMasterService<
  PendidikanEntity,
  CreatePendidikanDto,
  UpdatePendidikanDto,
  QueryPendidikanDto
> {
  constructor(
    protected readonly repo: PendidikanRepository,
    protected readonly prisma: PrismaService
  ) {
    super(repo, prisma)
  }

  protected async beforeCreateTx(tx: any, dto: CreatePendidikanDto) {
    await this.ensureNoDuplicateKodeTx(tx, dto.kode)
    await this.ensureNoDuplicateNamaTx(tx, dto.nama)

    if (dto.tingkatId) {
      const exists = await this.repo.tingkatExists(
        BigInt(dto.tingkatId),
        tx
      )

      if (!exists) {
        throw new BadRequestException(
          'Tingkat pendidikan tidak ditemukan'
        )
      }
    }
  }

  protected async beforeUpdateTx(
    tx: any,
    id: bigint,
    dto: UpdatePendidikanDto
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

    if (dto.tingkatId) {
      const exists = await this.repo.tingkatExists(
        BigInt(dto.tingkatId),
        tx
      )

      if (!exists) {
        throw new BadRequestException(
          'Tingkat pendidikan tidak ditemukan'
        )
      }
    }
  }

  protected async beforeDeleteTx(tx: any, id: bigint) {
    const referenced = await this.repo.isReferenced(id, tx)

    if (referenced) {
      throw new BadRequestException(
        'Pendidikan tidak dapat dihapus karena masih digunakan'
      )
    }
  }

  private async ensureNoDuplicateKodeTx(
    tx: any,
    kode: string
  ) {
    const existing = await this.repo.findByKode(kode, tx)
    if (existing) {
      throw new BadRequestException('Kode sudah digunakan')
    }
  }

  private async ensureNoDuplicateNamaTx(
    tx: any,
    nama: string
  ) {
    const existing = await this.repo.findByNama(nama, tx)
    if (existing) {
      throw new BadRequestException('Nama sudah digunakan')
    }
  }
}