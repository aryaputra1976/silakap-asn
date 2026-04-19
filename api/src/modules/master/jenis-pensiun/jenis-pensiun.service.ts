import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { BaseMasterService } from '@/modules/master/core/base-master.service'
import {
  JenisPensiunRepository,
  JenisPensiunEntity,
} from './jenis-pensiun.repository'
import { CreateJenisPensiunDto } from './dto/create-jenis-pensiun.dto'
import { UpdateJenisPensiunDto } from './dto/update-jenis-pensiun.dto'
import { QueryJenisPensiunDto } from './dto/query-jenis-pensiun.dto'

@Injectable()
export class JenisPensiunService extends BaseMasterService<
  JenisPensiunEntity,
  CreateJenisPensiunDto,
  UpdateJenisPensiunDto,
  QueryJenisPensiunDto
> {
  constructor(
    protected readonly repo: JenisPensiunRepository,
    protected readonly prisma: PrismaService
  ) {
    super(repo, prisma)
  }

  protected async beforeCreateTx(
    tx: any,
    dto: CreateJenisPensiunDto
  ): Promise<void> {
    await this.ensureNoDuplicateKodeTx(tx, dto.kode)
    await this.ensureNoDuplicateNamaTx(tx, dto.nama)
  }

  protected async beforeUpdateTx(
    tx: any,
    id: bigint,
    dto: UpdateJenisPensiunDto
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
        'Jenis Pensiun tidak dapat dihapus karena masih digunakan'
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