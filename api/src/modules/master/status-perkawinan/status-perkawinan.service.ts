import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { BaseMasterService } from '@/modules/master/core/base-master.service'
import {
  StatusPerkawinanRepository,
  StatusPerkawinanEntity,
} from './status-perkawinan.repository'
import { CreateStatusPerkawinanDto } from './dto/create-status-perkawinan.dto'
import { UpdateStatusPerkawinanDto } from './dto/update-status-perkawinan.dto'
import { QueryStatusPerkawinanDto } from './dto/query-status-perkawinan.dto'

@Injectable()
export class StatusPerkawinanService extends BaseMasterService<
  StatusPerkawinanEntity,
  CreateStatusPerkawinanDto,
  UpdateStatusPerkawinanDto,
  QueryStatusPerkawinanDto
> {
  constructor(
    protected readonly repo: StatusPerkawinanRepository,
    protected readonly prisma: PrismaService
  ) {
    super(repo, prisma)
  }

  protected async beforeCreateTx(
    tx: any,
    dto: CreateStatusPerkawinanDto
  ): Promise<void> {
    await this.ensureNoDuplicateKodeTx(tx, dto.kode)
    await this.ensureNoDuplicateNamaTx(tx, dto.nama)
  }

  protected async beforeUpdateTx(
    tx: any,
    id: bigint,
    dto: UpdateStatusPerkawinanDto
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
        'Status Perkawinan tidak dapat dihapus karena masih digunakan'
      )
    }
  }

  private async ensureNoDuplicateKodeTx(tx: any, kode: string) {
    const existing = await this.repo.findByKode(kode, tx)
    if (existing) {
      throw new BadRequestException('Kode sudah digunakan')
    }
  }

  private async ensureNoDuplicateNamaTx(tx: any, nama: string) {
    const existing = await this.repo.findByNama(nama, tx)
    if (existing) {
      throw new BadRequestException('Nama sudah digunakan')
    }
  }
}