import { PrismaClient } from "@prisma/client"

export class SLAQueryService {

  /**
   * Ambil semua SLA instance untuk suatu layanan
   */
  static async getByUsul(
    prisma: PrismaClient,
    usulId: bigint
  ) {

    return prisma.silakapWorkflowSLAInstance.findMany({

      where: {
        usulId
      },

      orderBy: {
        startedAt: "asc"
      }

    })

  }

  /**
   * Ambil SLA yang masih aktif
   */
  static async getActive(
    prisma: PrismaClient,
    usulId: bigint
  ) {

    return prisma.silakapWorkflowSLAInstance.findMany({

      where: {
        usulId,
        finishedAt: null
      },

      orderBy: {
        startedAt: "desc"
      }

    })

  }

  /**
   * Ambil SLA yang breach
   */
  static async getBreached(
    prisma: PrismaClient
  ) {

    return prisma.silakapWorkflowSLAInstance.findMany({

      where: {
        isBreached: true
      },

      orderBy: {
        dueAt: "asc"
      }

    })

  }

  /**
   * Dashboard statistik SLA
   */
  static async getStats(
    prisma: PrismaClient
  ) {

    const total =
      await prisma.silakapWorkflowSLAInstance.count()

    const active =
      await prisma.silakapWorkflowSLAInstance.count({

        where: {
          finishedAt: null
        }

      })

    const breached =
      await prisma.silakapWorkflowSLAInstance.count({

        where: {
          isBreached: true
        }

      })

    return {
      total,
      active,
      breached
    }

  }

}