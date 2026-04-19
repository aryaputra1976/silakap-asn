import { Prisma, LayananStatus } from "@prisma/client"

export class SLAEngine {

  /**
   * Start SLA ketika workflow masuk state baru
   */
  static async start(
    tx: Prisma.TransactionClient,
    usulId: bigint,
    jenisLayananId: bigint,
    state: LayananStatus
  ) {

    const config =
      await tx.silakapWorkflowSLA.findUnique({

        where: {
          jenisLayananId_state: {
            jenisLayananId,
            state
          }
        }

      })

    if (!config) return

    const now = new Date()

    const dueAt = new Date(
      now.getTime() + config.durationMinutes * 60000
    )

    await tx.silakapWorkflowSLAInstance.create({

      data: {
        usulId,
        state,
        startedAt: now,
        dueAt
      }

    })

  }

  /**
   * Finish SLA ketika workflow keluar dari state
   */
  static async finish(
    tx: Prisma.TransactionClient,
    usulId: bigint,
    state: LayananStatus
  ) {

    const active =
      await tx.silakapWorkflowSLAInstance.findFirst({

        where: {
          usulId,
          state,
          finishedAt: null
        }

      })

    if (!active) return

    await tx.silakapWorkflowSLAInstance.update({

      where: {
        id: active.id
      },

      data: {
        finishedAt: new Date()
      }

    })

  }

  /**
   * Monitor SLA breach
   */
  static async detectBreaches(
    tx: Prisma.TransactionClient
  ) {

    const now = new Date()

    const breached =
      await tx.silakapWorkflowSLAInstance.findMany({

        where: {
          finishedAt: null,
          dueAt: {
            lt: now
          },
          isBreached: false
        }

      })

    for (const sla of breached) {

      await tx.silakapWorkflowSLAInstance.update({

        where: {
          id: sla.id
        },

        data: {
          isBreached: true
        }

      })

    }

    return breached.length

  }

    static async detectWarnings(
    tx: Prisma.TransactionClient,
    warningMinutes = 60
    ) {

    const now = new Date()

    const warningTime =
        new Date(now.getTime() + warningMinutes * 60000)

    const warningList =
        await tx.silakapWorkflowSLAInstance.findMany({

        where: {
            finishedAt: null,
            isBreached: false,
            dueAt: {
            lte: warningTime,
            gt: now
            }
        }

        })

    return warningList

    }  
}