import { PrismaClient } from "@prisma/client"
import { SLAComplianceStats } from "../types/analytics.types"

export class WorkflowAnalyticsService {

  /**
   * Hitung durasi layanan
   */
  static async getServiceDurations(
    prisma: PrismaClient,
    usulId: bigint
  ) {

    const timelines =
      await prisma.silakapWorkflowTimeline.findMany({

        where: {
          usulId
        },

        orderBy: {
          createdAt: "asc"
        }

      })

    const durations = []

    for (let i = 0; i < timelines.length - 1; i++) {

      const start = timelines[i]
      const end = timelines[i + 1]

      const duration =
        (end.createdAt.getTime() - start.createdAt.getTime()) / 60000

      durations.push({

        state: start.toStatus,

        startedAt: start.createdAt,

        finishedAt: end.createdAt,

        durationMinutes: Math.round(duration)

      })

    }

    return durations

  }

  /**
   * SLA compliance rate
   */
  static async getSLACompliance(
    prisma: PrismaClient
  ): Promise<SLAComplianceStats> {

    const total =
      await prisma.silakapWorkflowSLAInstance.count()

    const breached =
      await prisma.silakapWorkflowSLAInstance.count({

        where: {
          isBreached: true
        }

      })

    const compliant = total - breached

    const complianceRate =
      total === 0
        ? 0
        : (compliant / total) * 100

    return {
      total,
      breached,
      compliant,
      complianceRate: Math.round(complianceRate)
    }

  }

  /**
   * Layanan paling lambat
   */
  static async getSlowestServices(
    prisma: PrismaClient,
    limit = 10
  ) {

    return prisma.silakapWorkflowSLAInstance.findMany({

      where: {
        isBreached: true
      },

      orderBy: {
        dueAt: "asc"
      },

      take: limit

    })

  }

}