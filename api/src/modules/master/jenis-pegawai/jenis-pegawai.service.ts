import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { BaseMasterService } from '@/modules/master/core/base-master.service'
import {
  JenisPegawaiRepository,
  JenisPegawaiEntity,
} from './jenis-pegawai.repository'
import { CreateJenisPegawaiDto } from './dto/create-jenis-pegawai.dto'
import { UpdateJenisPegawaiDto } from './dto/update-jenis-pegawai.dto'
import { QueryJenisPegawaiDto } from './dto/query-jenis-pegawai.dto'

@Injectable()
export class JenisPegawaiService extends BaseMasterService<
  JenisPegawaiEntity,
  CreateJenisPegawaiDto,
  UpdateJenisPegawaiDto,
  QueryJenisPegawaiDto
> {
  constructor(
    protected readonly repo: JenisPegawaiRepository,
    protected readonly prisma: PrismaService
  ) {
    super(repo, prisma)
  }

  protected async beforeCreateTx(
    tx: any,
    dto: CreateJenisPegawaiDto
  ): Promise<void> {
    await this.ensureNoDuplicateKodeTx(tx, dto.kode)
    await this.ensureNoDuplicateNamaTx(tx, dto.nama)
  }

  protected async beforeUpdateTx(
    tx: any,
    id: bigint,
    dto: UpdateJenisPegawaiDto
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
        'Jenis Pegawai tidak dapat dihapus karena masih digunakan'
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