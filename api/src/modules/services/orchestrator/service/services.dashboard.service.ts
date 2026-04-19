import { prisma } from '@/core/prisma/prisma.client'

export class ServicesDashboardService {

  /**
   * dashboard per layanan (dipakai frontend)
   */
  async getDashboard(service: string) {

    const jenis = await prisma.silakapJenisLayanan.findFirst({
      where: {
        kode: service
      },
      select: { id: true }
    })

    if (!jenis) {
      return {
        stats: [],
        recent: []
      }
    }

    const stats = await prisma.silakapUsulLayanan.groupBy({
      by: ['status'],
      where: {
        jenisLayananId: jenis.id
      },
      _count: { id: true }
    })

    const recent = await prisma.silakapUsulLayanan.findMany({
      where: {
        jenisLayananId: jenis.id
      },
      orderBy: { id: 'desc' },
      take: 5,
      include: {
        pegawai: {
          select: {
            id: true,
            nip: true,
            nama: true
          }
        }
      }
    })

    return {
      stats: stats.map(s => ({
        status: s.status,
        count: s._count.id
      })),
      recent
    }

  }

  /**
   * total usul semua layanan
   */
  async totalUsul() {

    const total = await prisma.silakapUsulLayanan.count()

    return { total }

  }

  /**
   * jumlah usul berdasarkan status
   */
  async usulByStatus() {

    const grouped = await prisma.silakapUsulLayanan.groupBy({
      by: ['status'],
      _count: { id: true }
    })

    const result: Record<string, number> = {}

    grouped.forEach(row => {
      result[row.status] = row._count.id
    })

    return result

  }

  /**
   * jumlah usul berdasarkan jenis layanan
   */
  async usulByJenisLayanan() {

    return prisma.$transaction(async (tx) => {

      const grouped = await tx.silakapUsulLayanan.groupBy({
        by: ['jenisLayananId'],
        _count: { id: true }
      })

      const jenis = await tx.silakapJenisLayanan.findMany({
        select: {
          id: true,
          nama: true
        }
      })

      const jenisMap = new Map(
        jenis.map(j => [j.id, j.nama])
      )

      return grouped.map(row => ({
        jenisLayananId: row.jenisLayananId,
        nama: jenisMap.get(row.jenisLayananId) ?? null,
        total: row._count.id
      }))

    })

  }

  /**
   * usul terbaru
   */
  async latestUsul(limit = 10) {

    return prisma.silakapUsulLayanan.findMany({
      orderBy: { id: 'desc' },
      take: limit,
      include: {
        pegawai: {
          select: {
            id: true,
            nip: true,
            nama: true
          }
        },
        jenis: {
          select: {
            id: true,
            nama: true
          }
        }
      }
    })

  }

  /**
   * statistik per pegawai
   */
  async usulByPegawai(pegawaiId: bigint) {

    return prisma.$transaction(async (tx) => {

      const total = await tx.silakapUsulLayanan.count({
        where: { pegawaiId }
      })

      const byStatus = await tx.silakapUsulLayanan.groupBy({
        by: ['status'],
        where: { pegawaiId },
        _count: { id: true }
      })

      return {
        total,
        byStatus
      }

    })

  }

  /**
   * monitoring SIASN job
   */
  async siasnJobStats() {

    const grouped = await prisma.silakapSiasnJob.groupBy({
      by: ['status'],
      _count: { id: true }
    })

    const result: Record<string, number> = {}

    grouped.forEach(row => {
      result[row.status] = row._count.id
    })

    return result

  }

}