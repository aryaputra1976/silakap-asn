import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { BaseMasterService } from '@/modules/master/core/base-master.service'
import {
  KedudukanHukumRepository,
  KedudukanHukumEntity,
} from './kedudukan-hukum.repository'
import { CreateKedudukanHukumDto } from './dto/create-kedudukan-hukum.dto'
import { UpdateKedudukanHukumDto } from './dto/update-kedudukan-hukum.dto'
import { QueryKedudukanHukumDto } from './dto/query-kedudukan-hukum.dto'

@Injectable()
export class KedudukanHukumService extends BaseMasterService<
  KedudukanHukumEntity,
  CreateKedudukanHukumDto,
  UpdateKedudukanHukumDto,
  QueryKedudukanHukumDto
> {
  constructor(
    protected readonly repo: KedudukanHukumRepository,
    protected readonly prisma: PrismaService
  ) {
    super(repo, prisma)
  }

  protected async beforeCreateTx(tx: any, dto: CreateKedudukanHukumDto) {
    await this.ensureNoDuplicateKodeTx(tx, dto.kode)
    await this.ensureNoDuplicateNamaTx(tx, dto.nama)
  }

  protected async beforeUpdateTx(
    tx: any,
    id: bigint,
    dto: UpdateKedudukanHukumDto
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
        'Kedudukan Hukum tidak dapat dihapus karena masih digunakan pegawai'
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