import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { BaseMasterService } from '@/modules/master/core/base-master.service'
import {
  KpknRepository,
  KpknEntity,
} from './kpkn.repository'
import { CreateKpknDto } from './dto/create-kpkn.dto'
import { UpdateKpknDto } from './dto/update-kpkn.dto'
import { QueryKpknDto } from './dto/query-kpkn.dto'

@Injectable()
export class KpknService extends BaseMasterService<
  KpknEntity,
  CreateKpknDto,
  UpdateKpknDto,
  QueryKpknDto
> {
  constructor(
    protected readonly repo: KpknRepository,
    protected readonly prisma: PrismaService
  ) {
    super(repo, prisma)
  }

  protected async beforeCreateTx(tx: any, dto: CreateKpknDto) {
    await this.ensureNoDuplicateKodeTx(tx, dto.kode)
    await this.ensureNoDuplicateNamaTx(tx, dto.nama)
  }

  protected async beforeUpdateTx(
    tx: any,
    id: bigint,
    dto: UpdateKpknDto
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
        'KPKN tidak dapat dihapus karena masih digunakan pegawai'
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