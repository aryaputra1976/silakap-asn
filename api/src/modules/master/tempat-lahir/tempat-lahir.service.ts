import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { BaseMasterService } from '@/modules/master/core/base-master.service'
import {
  TempatLahirRepository,
  TempatLahirEntity,
} from './tempat-lahir.repository'
import { CreateTempatLahirDto } from './dto/create-tempat-lahir.dto'
import { UpdateTempatLahirDto } from './dto/update-tempat-lahir.dto'
import { QueryTempatLahirDto } from './dto/query-tempat-lahir.dto'

@Injectable()
export class TempatLahirService extends BaseMasterService<
  TempatLahirEntity,
  CreateTempatLahirDto,
  UpdateTempatLahirDto,
  QueryTempatLahirDto
> {
  constructor(
    protected readonly repo: TempatLahirRepository,
    protected readonly prisma: PrismaService
  ) {
    super(repo, prisma)
  }

  protected async beforeCreateTx(tx: any, dto: CreateTempatLahirDto) {
    await this.ensureNoDuplicateKodeTx(tx, dto.kode)
    await this.ensureNoDuplicateNamaTx(tx, dto.nama)
  }

  protected async beforeUpdateTx(
    tx: any,
    id: bigint,
    dto: UpdateTempatLahirDto
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
        'Tempat Lahir tidak dapat dihapus karena masih digunakan pegawai'
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