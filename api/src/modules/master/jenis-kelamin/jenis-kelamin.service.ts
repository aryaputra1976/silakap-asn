import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { BaseMasterService } from '@/modules/master/core/base-master.service'
import {
  JenisKelaminRepository,
  JenisKelaminEntity,
} from './jenis-kelamin.repository'
import { CreateJenisKelaminDto } from './dto/create-jenis-kelamin.dto'
import { UpdateJenisKelaminDto } from './dto/update-jenis-kelamin.dto'
import { QueryJenisKelaminDto } from './dto/query-jenis-kelamin.dto'

@Injectable()
export class JenisKelaminService extends BaseMasterService<
  JenisKelaminEntity,
  CreateJenisKelaminDto,
  UpdateJenisKelaminDto,
  QueryJenisKelaminDto
> {
  constructor(
    protected readonly repo: JenisKelaminRepository,
    protected readonly prisma: PrismaService
  ) {
    super(repo, prisma)
  }

  protected async beforeCreateTx(
    tx: any,
    dto: CreateJenisKelaminDto
  ): Promise<void> {
    await this.ensureNoDuplicateKodeTx(tx, dto.kode)
    await this.ensureNoDuplicateNamaTx(tx, dto.nama)
  }

  protected async beforeUpdateTx(
    tx: any,
    id: bigint,
    dto: UpdateJenisKelaminDto
  ): Promise<void> {
    if (dto.nama) {
      const existing = await this.repo.findByNama(dto.nama, tx)

      if (existing && existing.id !== id) {
        throw new BadRequestException('Nama sudah digunakan')
      }
    }
  }

  protected async beforeDeleteTx(
    tx: any,
    id: bigint
  ): Promise<void> {
    const referenced = await this.repo.isReferenced(id, tx)

    if (referenced) {
      throw new BadRequestException(
        'Jenis Kelamin tidak dapat dihapus karena masih digunakan'
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