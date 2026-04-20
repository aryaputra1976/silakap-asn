import { Injectable } from '@nestjs/common'

import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class ServicesDashboardService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getDashboard(service: string) {
    const jenis =
      await this.prisma.silakapJenisLayanan.findFirst({
        where: {
          kode: service,
        },
        select: { id: true },
      })

    if (!jenis) {
      return {
        stats: [],
        recent: [],
      }
    }

    const stats =
      await this.prisma.silakapUsulLayanan.groupBy({
        by: ['status'],
        where: {
          jenisLayananId: jenis.id,
        },
        _count: { id: true },
      })

    const recent =
      await this.prisma.silakapUsulLayanan.findMany({
        where: {
          jenisLayananId: jenis.id,
        },
        orderBy: { id: 'desc' },
        take: 5,
        include: {
          pegawai: {
            select: {
              id: true,
              nip: true,
              nama: true,
            },
          },
        },
      })

    return {
      stats: stats.map((row) => ({
        status: row.status,
        count: row._count.id,
      })),
      recent,
    }
  }

  async totalUsul() {
    const total = await this.prisma.silakapUsulLayanan.count()

    return { total }
  }

  async usulByStatus() {
    const grouped =
      await this.prisma.silakapUsulLayanan.groupBy({
        by: ['status'],
        _count: { id: true },
      })

    const result: Record<string, number> = {}

    grouped.forEach((row) => {
      result[row.status] = row._count.id
    })

    return result
  }

  async usulByJenisLayanan() {
    return this.prisma.$transaction(async (tx) => {
      const grouped =
        await tx.silakapUsulLayanan.groupBy({
          by: ['jenisLayananId'],
          _count: { id: true },
        })

      const jenis = await tx.silakapJenisLayanan.findMany({
        select: {
          id: true,
          nama: true,
        },
      })

      const jenisMap = new Map(
        jenis.map((row) => [row.id, row.nama]),
      )

      return grouped.map((row) => ({
        jenisLayananId: row.jenisLayananId,
        nama: jenisMap.get(row.jenisLayananId) ?? null,
        total: row._count.id,
      }))
    })
  }

  async latestUsul(limit = 10) {
    return this.prisma.silakapUsulLayanan.findMany({
      orderBy: { id: 'desc' },
      take: limit,
      include: {
        pegawai: {
          select: {
            id: true,
            nip: true,
            nama: true,
          },
        },
        jenis: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    })
  }

  async usulByPegawai(pegawaiId: bigint) {
    return this.prisma.$transaction(async (tx) => {
      const total =
        await tx.silakapUsulLayanan.count({
          where: { pegawaiId },
        })

      const byStatus =
        await tx.silakapUsulLayanan.groupBy({
          by: ['status'],
          where: { pegawaiId },
          _count: { id: true },
        })

      return {
        total,
        byStatus,
      }
    })
  }

  async siasnJobStats() {
    const grouped =
      await this.prisma.silakapSiasnJob.groupBy({
        by: ['status'],
        _count: { id: true },
      })

    const result: Record<string, number> = {}

    grouped.forEach((row) => {
      result[row.status] = row._count.id
    })

    return result
  }
}
