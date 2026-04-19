import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { BaseMasterService } from '@/modules/master/core/base-master.service'
import {
  UnorRepository,
  UnorEntity,
} from './unor.repository'
import { CreateUnorDto } from './dto/create-unor.dto'
import { UpdateUnorDto } from './dto/update-unor.dto'
import { QueryUnorDto } from './dto/query-unor.dto'

@Injectable()
export class UnorService extends BaseMasterService<
  UnorEntity,
  CreateUnorDto,
  UpdateUnorDto,
  QueryUnorDto
> {
  constructor(
    protected readonly repo: UnorRepository,
    protected readonly prisma: PrismaService
  ) {
    super(repo, prisma)
  }

  protected async beforeCreateTx(tx: any, dto: CreateUnorDto) {
    await this.ensureNoDuplicateKodeTx(tx, dto.kode)
    await this.ensureNoDuplicateNamaTx(tx, dto.nama)
  }

  protected async beforeUpdateTx(
    tx: any,
    id: bigint,
    dto: UpdateUnorDto
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
        'Unor tidak dapat dihapus karena masih digunakan'
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