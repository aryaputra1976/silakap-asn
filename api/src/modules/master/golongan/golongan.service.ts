import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { BaseMasterService } from '@/modules/master/core/base-master.service'
import {
  GolonganRepository,
  GolonganEntity,
} from './golongan.repository'
import { CreateGolonganDto } from './dto/create-golongan.dto'
import { UpdateGolonganDto } from './dto/update-golongan.dto'
import { QueryGolonganDto } from './dto/query-golongan.dto'

@Injectable()
export class GolonganService extends BaseMasterService<
  GolonganEntity,
  CreateGolonganDto,
  UpdateGolonganDto,
  QueryGolonganDto
> {
  constructor(
    protected readonly repo: GolonganRepository,
    protected readonly prisma: PrismaService
  ) {
    super(repo, prisma)
  }

  protected async beforeCreateTx(
    tx: any,
    dto: CreateGolonganDto
  ): Promise<void> {
    await this.ensureNoDuplicateKodeTx(tx, dto.kode)
    await this.ensureNoDuplicateNamaTx(tx, dto.nama)
  }

  protected async beforeUpdateTx(
    tx: any,
    id: bigint,
    dto: UpdateGolonganDto
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
        'Golongan tidak dapat dihapus karena masih direferensikan'
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