import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { BaseMasterService } from '@/modules/master/core/base-master.service'
import {
  LokasiKerjaRepository,
  LokasiKerjaEntity,
} from './lokasi-kerja.repository'
import { CreateLokasiKerjaDto } from './dto/create-lokasi-kerja.dto'
import { UpdateLokasiKerjaDto } from './dto/update-lokasi-kerja.dto'
import { QueryLokasiKerjaDto } from './dto/query-lokasi-kerja.dto'

@Injectable()
export class LokasiKerjaService extends BaseMasterService<
  LokasiKerjaEntity,
  CreateLokasiKerjaDto,
  UpdateLokasiKerjaDto,
  QueryLokasiKerjaDto
> {
  constructor(
    protected readonly repo: LokasiKerjaRepository,
    protected readonly prisma: PrismaService
  ) {
    super(repo, prisma)
  }

  protected async beforeCreateTx(
    tx: any,
    dto: CreateLokasiKerjaDto
  ) {
    await this.ensureNoDuplicateKodeTx(tx, dto.kode)
    await this.ensureNoDuplicateNamaTx(tx, dto.nama)
  }

  protected async beforeUpdateTx(
    tx: any,
    id: bigint,
    dto: UpdateLokasiKerjaDto
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
        'Lokasi Kerja tidak dapat dihapus karena masih digunakan'
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