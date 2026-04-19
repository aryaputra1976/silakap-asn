import { Injectable } from "@nestjs/common"
import { Prisma, LayananStatus } from "@prisma/client"
import { PrismaService } from "@/prisma/prisma.service"

import {
  DashboardActivityDto,
  DashboardNotificationDto,
} from "../dto"

const FINAL_STATUSES: LayananStatus[] = [
  LayananStatus.APPROVED,
  LayananStatus.REJECTED,
  LayananStatus.SYNCED_SIASN,
  LayananStatus.FAILED_SIASN,
]

interface RBACContext {
  userId: bigint
  roleName: string
  bidangId?: bigint | null
  unitKerjaId?: bigint | null
}

@Injectable()
export class DashboardQuery {

  constructor(private readonly prisma: PrismaService) {}

  /* ======================================================
     RBAC WHERE BUILDER
  ====================================================== */

  private async buildUsulWhere(
    ctx: RBACContext
  ): Promise<Prisma.SilakapUsulLayananWhereInput> {

    if (ctx.roleName === "SUPERADMIN") {
      return {}
    }

    if (ctx.bidangId) {

      const layanan =
        await this.prisma.silakapLayananBidang.findMany({
          where: { bidangId: ctx.bidangId },
          select: { jenisLayananId: true },
        })

      const layananIds = layanan.map(l => l.jenisLayananId)

      return {
        jenisLayananId: {
          in: layananIds.length ? layananIds : [BigInt(0)]
        }
      }
    }

    if (ctx.unitKerjaId) {
      return {
        pegawai: {
          riwayatJabatan: {
            some: {
              unorId: ctx.unitKerjaId
            }
          }
        }
      }
    }

    return {
      pegawaiId: ctx.userId
    }
  }

  /* ======================================================
     DASHBOARD STATS
  ====================================================== */

  async getStatsRBAC(ctx: RBACContext) {

    const whereUsul = await this.buildUsulWhere(ctx)

    const [totalAsn, totalUsul, usulProses, usulSelesai] =
      await Promise.all([

        this.prisma.silakapPegawai.count({
          where: {
            statusAktif: true,
            ...(ctx.unitKerjaId && {
              riwayatJabatan: {
                some: {
                  unorId: ctx.unitKerjaId
                }
              }
            })
          }
        }),

        this.prisma.silakapUsulLayanan.count({
          where: whereUsul
        }),

        this.prisma.silakapUsulLayanan.count({
          where: {
            ...whereUsul,
            status: {
              notIn: FINAL_STATUSES
            }
          }
        }),

        this.prisma.silakapUsulLayanan.count({
          where: {
            ...whereUsul,
            status: LayananStatus.APPROVED
          }
        })

      ])

    return {
      totalAsn,
      totalUsul,
      usulProses,
      usulSelesai
    }
  }

  /* ======================================================
     ACTIVITY
  ====================================================== */

  async getActivitiesRBAC(
    ctx: RBACContext
  ): Promise<DashboardActivityDto[]> {

    const where: Prisma.SilakapActivityWhereInput =
      ctx.roleName === "SUPERADMIN"
        ? {}
        : { userId: ctx.userId }

    const data =
      await this.prisma.silakapActivity.findMany({
        where,
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          createdAt: true
        }
      })

    return data.map(item => ({
      id: Number(item.id),
      judul: item.title,
      tanggal: item.createdAt.toISOString()
    }))
  }

  /* ======================================================
     NOTIFICATIONS
  ====================================================== */

  async getNotifications(
    userId: bigint
  ): Promise<DashboardNotificationDto[]> {

    const data =
      await this.prisma.silakapNotification.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          message: true,
          createdAt: true,
          isRead: true
        }
      })

    return data.map(item => ({
      id: Number(item.id),
      judul: item.title,
      message: item.message,
      tanggal: item.createdAt.toISOString(),
      read: item.isRead
    }))
  }

  /* ======================================================
     SLA STATS
  ====================================================== */

  async getSlaStats(ctx: RBACContext) {

    const whereUsul = await this.buildUsulWhere(ctx)

    const now = new Date()
    const next1Hour = new Date(now.getTime() + 60 * 60 * 1000)

    const [overdue, warning, totalActive] =
      await Promise.all([

        this.prisma.silakapUsulLayanan.count({
          where: {
            ...whereUsul,
            slaDeadline: { lt: now },
            status: { notIn: FINAL_STATUSES }
          }
        }),

        this.prisma.silakapUsulLayanan.count({
          where: {
            ...whereUsul,
            slaDeadline: {
              gte: now,
              lte: next1Hour
            },
            status: { notIn: FINAL_STATUSES }
          }
        }),

        this.prisma.silakapUsulLayanan.count({
          where: {
            ...whereUsul,
            status: { notIn: FINAL_STATUSES }
          }
        })

      ])

    const compliance =
      totalActive === 0
        ? 100
        : Math.round(((totalActive - overdue) / totalActive) * 100)

    return {
      overdue,
      warning,
      compliance
    }
  }

  /* ======================================================
     BOTTLENECK STATUS
  ====================================================== */

  async getBottleneckStatus(ctx: RBACContext) {

    const whereUsul = await this.buildUsulWhere(ctx)

    const result =
      await this.prisma.silakapUsulLayanan.groupBy({
        by: ["status"],
        where: {
          ...whereUsul,
          status: { notIn: FINAL_STATUSES }
        },
        _count: {
          status: true
        },
        orderBy: {
          _count: {
            status: "desc"
          }
        }
      })

    return result.map(r => ({
      status: r.status,
      total: r._count.status
    }))
  }

  /* ======================================================
     LONGEST PROCESS
  ====================================================== */

  async getLongestProcess(ctx: RBACContext) {

    const whereUsul = await this.buildUsulWhere(ctx)

    return this.prisma.silakapUsulLayanan.findMany({
      where: {
        ...whereUsul,
        status: { notIn: FINAL_STATUSES },
        tanggalUsul: {
          gt: new Date(0)
        }
      },
      orderBy: {
        tanggalUsul: "asc"
      },
      take: 5,
      select: {
        id: true,
        status: true,
        tanggalUsul: true,
        jenis: {
          select: {
            nama: true
          }
        },
        pegawai: {
          select: {
            nama: true
          }
        }
      }
    })
  }

}