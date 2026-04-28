import { Prisma, PrismaClient, LayananStatus } from "@prisma/client"

export class WorkflowTimelineService {

  static async create(
    tx: Prisma.TransactionClient,
    usulId: bigint,
    fromStatus: LayananStatus,
    toStatus: LayananStatus,
    actorUserId?: bigint,
  ) {

    // Dedupe: satu record per (usul, fromStatus, toStatus).
    // Mencegah duplikat jika aksi yang sama diulang dalam transaksi SERIALIZABLE.
    const existing =
      await tx.silakapWorkflowTimeline.findFirst({

        where: {
          usulId,
          fromStatus,
          toStatus
        },

        select: { id: true }

      })

    if (existing) return

    await tx.silakapWorkflowTimeline.create({

      data: {
        usulId,
        fromStatus,
        toStatus,
        actorId: actorUserId,
      }

    })

  }

  static async getTimeline(
    prisma: PrismaClient,
    usulId: bigint
  ) {

    return prisma.silakapWorkflowTimeline.findMany({

      where: { usulId },

      orderBy: {
        createdAt: "asc"
      }

    })

  }

  static async getFullTimeline(
    prisma: PrismaClient,
    usulId: bigint
  ) {

    const workflowTimeline =
      await prisma.silakapWorkflowTimeline.findMany({

        where: { usulId },

        orderBy: {
          createdAt: "asc"
        }

      })

    const auditLogs =
      await prisma.auditLog.findMany({

        where: {
          entity: "LAYANAN",
          entityId: usulId.toString()
        },

        orderBy: {
          createdAt: "asc"
        }

      })

    return {
      workflow: workflowTimeline,
      audit: auditLogs
    }

  }

}