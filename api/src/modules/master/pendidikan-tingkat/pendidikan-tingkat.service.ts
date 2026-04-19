import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { BaseMasterService } from '@/modules/master/core/base-master.service'
import {
  PendidikanTingkatRepository,
  PendidikanTingkatEntity,
} from './pendidikan-tingkat.repository'
import { CreatePendidikanTingkatDto } from './dto/create-pendidikan-tingkat.dto'
import { UpdatePendidikanTingkatDto } from './dto/update-pendidikan-tingkat.dto'
import { QueryPendidikanTingkatDto } from './dto/query-pendidikan-tingkat.dto'

@Injectable()
export class PendidikanTingkatService extends BaseMasterService<
  PendidikanTingkatEntity,
  CreatePendidikanTingkatDto,
  UpdatePendidikanTingkatDto,
  QueryPendidikanTingkatDto
> {
  constructor(
    protected readonly repo: PendidikanTingkatRepository,
    protected readonly prisma: PrismaService
  ) {
    super(repo, prisma)
  }

  protected async beforeCreateTx(tx: any, dto: CreatePendidikanTingkatDto) {
    await this.ensureNoDuplicateKodeTx(tx, dto.kode)
    await this.ensureNoDuplicateNamaTx(tx, dto.nama)
  }

  protected async beforeUpdateTx(
    tx: any,
    id: bigint,
    dto: UpdatePendidikanTingkatDto
  ) {
    if (dto.nama) {
      const existing = await this.repo.findByNama(dto.nama, tx)
      if (existing && existing.id !== id) {
        throw new BadRequestException('Nama sudah digunakan')
      }
    }
  }

  protected async beforeDeleteTx(tx: any, id: bigint) {
    const referenced = await this.repo.isReferenced(id, tx)
    if (referenced) {
      throw new BadRequestException(
        'Pendidikan Tingkat tidak dapat dihapus karena masih digunakan'
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