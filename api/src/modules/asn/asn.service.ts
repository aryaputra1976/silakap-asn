import { Injectable } from "@nestjs/common"
import { AsnRepository } from "./asn.repository"
import { QueryAsnDto } from "./dto/query-asn.dto"
import { AsnDetailDto } from "./dto/asn-detail.dto"
import { NotFoundException } from "@/core/exceptions"
import { AsnMapper } from "./mapper/asn.mapper"
import { AsnListDto } from "./dto/asn-list.dto"
import { RiwayatJabatanDto } from "./dto/riwayat-jabatan.dto"
import { RiwayatPangkatDto } from "./dto/riwayat-pangkat.dto"
import { RiwayatPendidikanDto } from "./dto/riwayat-pendidikan.dto"
import { RiwayatDiklatDto } from "./dto/riwayat-diklat.dto"
import { RiwayatKeluargaDto } from "./dto/riwayat-keluarga.dto"
import { AuthenticatedUser } from "@/modules/auth/strategies/jwt.strategy"
import { PrismaService } from "@/prisma/prisma.service"

@Injectable()
export class AsnService {

  constructor(
    private repo: AsnRepository,
    private prisma: PrismaService,
  ) {}

  private isOperator(user: AuthenticatedUser | null | undefined) {
    return Boolean(user?.roles?.includes("OPERATOR"))
  }

  private async resolveOperatorScopeUnorId(
    user: AuthenticatedUser | null | undefined,
  ): Promise<string | null> {
    if (!this.isOperator(user)) {
      return null
    }

    const unitKerjaId = user?.unitKerjaId

    if (!unitKerjaId) {
      return null
    }

    let current = await this.prisma.refUnor.findUnique({
      where: { id: BigInt(unitKerjaId) },
      select: {
        id: true,
        level: true,
        parentId: true,
      },
    })

    while (current) {
      if (current.level === 2) {
        return current.id.toString()
      }

      if (!current.parentId) {
        break
      }

      current = await this.prisma.refUnor.findUnique({
        where: { id: current.parentId },
        select: {
          id: true,
          level: true,
          parentId: true,
        },
      })
    }

    return unitKerjaId
  }

  async findAll(user: AuthenticatedUser, query: QueryAsnDto) {
    const scopedUnorId = await this.resolveOperatorScopeUnorId(user)

    if (this.isOperator(user) && !scopedUnorId) {
      return {
        data: [],
        meta: {
          total: 0,
          page: Number(query.page ?? 1),
          limit: Number(query.limit ?? 20),
        },
      }
    }

    const result = await this.repo.findAll(
      {
        ...query,
        unorId: scopedUnorId ?? query.unorId,
      },
    )

    return {
      ...result,
      data: result.data.map(AsnMapper.toList) as AsnListDto[],
    }

  }

  async findOne(
    user: AuthenticatedUser,
    id: bigint,
  ): Promise<AsnDetailDto> {
    const scopedUnorId = await this.resolveOperatorScopeUnorId(user)

    if (this.isOperator(user) && !scopedUnorId) {
      throw new NotFoundException("ASN tidak ditemukan")
    }

    const asn = await this.repo.findById(id, scopedUnorId ?? undefined)

    if (!asn) {
      throw new NotFoundException("ASN tidak ditemukan")
    }

    return AsnMapper.toDetail(asn)

  }

  async getRiwayatJabatan(id: bigint): Promise<RiwayatJabatanDto[]> {
    const rows = await this.repo.findRiwayatJabatan(id)

    return rows.map((r) => ({
      id: Number(r.id),
      tmt: r.tmtJabatan,
      nomorSk: r.nomorSk ?? null,
      tanggalSk: r.tanggalSk ?? null,
      jabatan: (r as any).jabatan?.nama ?? null,
      jenisJabatan: (r as any).jenisJabatan?.nama ?? null,
      unitKerja: (r as any).unor?.nama ?? null,
      instansi: (r as any).instansi?.nama ?? null,
    }))
  }

  async getRiwayatPangkat(id: bigint): Promise<RiwayatPangkatDto[]> {
    const rows = await this.repo.findRiwayatPangkat(id)

    return rows.map((r) => ({
      id: Number(r.id),
      tmt: r.tmtPangkat,
      nomorSk: r.nomorSk ?? null,
      tanggalSk: r.tanggalSk ?? null,
      golongan: (r as any).golongan?.nama ?? null,
    }))
  }

  async getRiwayatPendidikan(id: bigint): Promise<RiwayatPendidikanDto[]> {
    const rows = await this.repo.findRiwayatPendidikan(id)

    return rows.map((r) => ({
      id: Number(r.id),
      jenjang: (r as any).pendidikanTingkat?.nama ?? null,
      bidangStudi: (r as any).pendidikan?.nama ?? null,
      namaSekolah: r.namaSekolah ?? null,
      tahunLulus: r.tahunLulus ?? null,
    }))
  }

  async getRiwayatDiklat(id: bigint): Promise<RiwayatDiklatDto[]> {
    const rows = await this.repo.findRiwayatDiklat(id)

    return rows.map((r) => ({
      id: Number(r.id),
      nama: r.nama ?? null,
      tahun: r.tahun ?? null,
    }))
  }

  async getRiwayatKeluarga(id: bigint): Promise<RiwayatKeluargaDto> {
    const { pasangan, anak } = await this.repo.findRiwayatKeluarga(id)

    return {
      pasangan: pasangan.map((p: any) => ({
        id: Number(p.id),
        nama: p.nama,
        tanggalLahir: p.tanggalLahir,
        tanggalNikah: p.tanggalNikah,
        urutanPernikahan: p.urutanPernikahan,
        statusPernikahan: p.statusPernikahan,
      })),
      anak: anak.map((a: any) => ({
        id: Number(a.id),
        nama: a.nama,
        tanggalLahir: a.tanggalLahir,
        statusAnak: a.statusAnak,
        namaAyah: a.namaAyah ?? null,
        namaIbu: a.namaIbu ?? null,
      })),
    }
  }

  async getStats(
    user: AuthenticatedUser,
    unorId?: string,
  ) {
    const scopedUnorId = await this.resolveOperatorScopeUnorId(user)

    if (this.isOperator(user) && !scopedUnorId) {
      return {
        total: 0,
        pns: 0,
        pppk: 0,
        pppkParuhWaktu: 0,
      }
    }

    return this.repo.getStats(scopedUnorId ?? unorId)
  }
}
