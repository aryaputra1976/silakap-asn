import { PrismaClient, LayananStatus } from "@prisma/client"
import { WorkflowEngine } from "../engine/workflow.engine"

export class WorkflowActionService {

  async changeStatus(
    prisma: PrismaClient,
    usulId: bigint,
    nextStatus: LayananStatus,
    actorRoleId?: bigint
  ) {

    return prisma.$transaction(async (tx) => {

      const layanan =
        await tx.silakapUsulLayanan.findUnique({

          where: { id: usulId },

          select: {
            id: true,
            status: true,
            jenisLayananId: true
          }

        })

      if (!layanan) {
        throw new Error("Usul layanan tidak ditemukan")
      }

      if (!layanan.jenisLayananId) {
        throw new Error("Jenis layanan tidak ditemukan")
      }

      /**
       * Prevent no-op transition
       */
      if (layanan.status === nextStatus) {
        throw new Error("Status layanan sudah sama")
      }

      /**
       * Jalankan workflow engine
       */
      await WorkflowEngine.transition(
        tx,
        usulId,
        layanan.jenisLayananId,
        layanan.status,
        nextStatus,
        actorRoleId?.toString()
      )

      /**
       * Audit log
       */
      await tx.auditLog.create({

        data: {

          entity: "LAYANAN",

          entityId: usulId.toString(),

          action: nextStatus,

          userId: actorRoleId,

          payload: {

            from: layanan.status,
            to: nextStatus

          }

        }

      })

      /**
       * Return layanan terbaru
       */
      return tx.silakapUsulLayanan.findUnique({
        where: { id: usulId }
      })

    })

  }

}