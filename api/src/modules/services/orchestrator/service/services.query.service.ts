import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { PrismaService } from '@/prisma/prisma.service'
import { BusinessError } from '@/core/errors/business.error'

@Injectable()
export class ServicesQueryService {
  constructor(
    private readonly prisma: PrismaService = new PrismaService(),
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
      },
    })

    if (!result) {
      throw new BusinessError(
        'USUL_NOT_FOUND',
        'Usul layanan tidak ditemukan',
      )
    }

    return result
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
}
