import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { BusinessError } from '@/core/errors/business.error'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class ServicesQueryService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getById(usulId: bigint) {
    const result = await this.prisma.silakapUsulLayanan.findUnique({
      where: { id: usulId },
      include: {
        pegawai: {
          select: {
            id: true,
            nip: true,
            nama: true,
          },
        },
        jenis: true,
        layananLog: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        dokumenUsul: true,
        peremajaan: true,
      },
    })

    if (!result) {
      throw new BusinessError(
        'USUL_NOT_FOUND',
        'Usul layanan tidak ditemukan',
      )
    }

    return {
      ...result,
      peremajaanDetail: result.peremajaan
        ? {
            jenisPerubahan: result.peremajaan.jenisPerubahan,
            keterangan: result.peremajaan.keterangan ?? null,
            nilaiLama: this.readJsonValue(result.peremajaan.dataLama),
            nilaiBaru: this.readJsonValue(result.peremajaan.dataBaru),
          }
        : null,
    }
  }

  async listByPegawai(pegawaiId: bigint) {
    return this.prisma.silakapUsulLayanan.findMany({
      where: { pegawaiId },
      include: {
        jenis: true,
      },
      orderBy: {
        id: 'desc',
      },
    })
  }

  async list(
    where: Prisma.SilakapUsulLayananWhereInput,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit

    const [data, total] = await this.prisma.$transaction([
      this.prisma.silakapUsulLayanan.findMany({
        where,
        include: {
          pegawai: {
            select: {
              id: true,
              nip: true,
              nama: true,
            },
          },
          jenis: true,
        },
        orderBy: {
          id: 'desc',
        },
        skip,
        take: limit,
      }),

      this.prisma.silakapUsulLayanan.count({ where }),
    ])

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async listByServiceCode(service: string) {
    const jenis =
      await this.prisma.silakapJenisLayanan.findFirst({
        where: { kode: service },
        select: { id: true },
      })

    if (!jenis) {
      return { message: 'Jenis layanan tidak ditemukan' }
    }

    return this.list({
      jenisLayananId: jenis.id,
    })
  }

  private readJsonValue(value: Prisma.JsonValue | null) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return null
    }

    const raw = (value as Prisma.JsonObject).value
    return typeof raw === 'string' && raw.trim() ? raw.trim() : null
  }
}
