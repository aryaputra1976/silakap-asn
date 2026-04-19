import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { BaseMasterService } from '@/modules/master/core/base-master.service'
import {
  StatusKepegawaianRepository,
  StatusKepegawaianEntity,
} from './status-kepegawaian.repository'
import { CreateStatusKepegawaianDto } from './dto/create-status-kepegawaian.dto'
import { UpdateStatusKepegawaianDto } from './dto/update-status-kepegawaian.dto'
import { QueryStatusKepegawaianDto } from './dto/query-status-kepegawaian.dto'

@Injectable()
export class StatusKepegawaianService extends BaseMasterService<
  StatusKepegawaianEntity,
  CreateStatusKepegawaianDto,
  UpdateStatusKepegawaianDto,
  QueryStatusKepegawaianDto
> {
  constructor(
    protected readonly repo: StatusKepegawaianRepository,
    protected readonly prisma: PrismaService
  ) {
    super(repo, prisma)
  }

  protected async beforeCreateTx(
    tx: any,
    dto: CreateStatusKepegawaianDto
  ): Promise<void> {
    await this.ensureNoDuplicateKodeTx(tx, dto.kode)
    await this.ensureNoDuplicateNamaTx(tx, dto.nama)
  }

  protected async beforeUpdateTx(
    tx: any,
    id: bigint,
    dto: UpdateStatusKepegawaianDto
  ): Promise<void> {
    if (dto.nama) {
      const existing = await this.repo.findByNama(dto.nama, tx)

      if (existing && existing.id !== id) {
        throw new BadRequestException('Nama sudah digunakan')
      }
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