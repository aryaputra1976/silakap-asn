import { Prisma, LayananStatus } from "@prisma/client"
import { BusinessError } from "@/core/errors/business.error"
import { WorkflowTimelineService } from "@/modules/workflow/service/workflow.timeline.service"

export class ServicesWorkflowService {

  async transition(
    tx: Prisma.TransactionClient,
    params: {
      usulId: bigint
      currentStatus: LayananStatus
      actionCode: string
      actorUserId?: bigint
      actorRoleId?: bigint
      jenisLayananId: bigint
    }
  ) {

    const actionCode = params.actionCode.toUpperCase()

    const template =
      await tx.silakapWorkflowTransition.findFirst({

        where: {
          jenisLayananId: params.jenisLayananId,
          fromState: params.currentStatus,
          actionCode
        },

        select: {
          toState: true
        }

      })

    if (!template) {

      throw new BusinessError(
        "WORKFLOW_NOT_FOUND",
        "Workflow transition tidak ditemukan"
      )

    }

    const nextStatus = template.toState

    /**
     * CALCULATE SLA
     */
    const slaDeadline =
      await this.calculateSLADeadline(
        tx,
        params.jenisLayananId,
        nextStatus
      )

    /**
     * UPDATE STATUS
     */
    const updated =
      await tx.silakapUsulLayanan.updateMany({

        where: {
          id: params.usulId,
          status: params.currentStatus
        },

        data: {
          status: nextStatus,
          slaDeadline,
          updatedAt: new Date()
        }

      })

    if (!updated.count) {

      throw new BusinessError(
        "WORKFLOW_RACE_CONDITION",
        "Workflow conflict"
      )

    }

    /**
     * INSERT LOG
     */
    await tx.silakapLayananLog.create({

      data: {
        usulId: params.usulId,
        roleId: params.actorRoleId ?? null,
        status: nextStatus,
        keterangan: `Action: ${actionCode}`
      }

    })

    await WorkflowTimelineService.create(
      tx,
      params.usulId,
      params.currentStatus,
      nextStatus,
      params.actorUserId
    )

    await tx.auditLog.create({
      data: {
        entity: "LAYANAN",
        entityId: params.usulId.toString(),
        action: actionCode,
        userId: params.actorUserId ?? null,
        payload: {
          from: params.currentStatus,
          to: nextStatus
        }
      }
    })

    return {
      usulId: params.usulId,
      status: nextStatus,
      slaDeadline
    }

  }

  private async calculateSLADeadline(
    tx: Prisma.TransactionClient,
    jenisLayananId: bigint,
    state: LayananStatus
  ): Promise<Date | null> {

    const sla =
      await tx.silakapWorkflowSLA.findUnique({

        where: {
          jenisLayananId_state: {
            jenisLayananId,
            state
          }
        },

        select: {
          durationMinutes: true
        }

      })

    if (!sla?.durationMinutes) return null

    return new Date(
      Date.now() + Number(sla.durationMinutes) * 60000
    )

  }

}
