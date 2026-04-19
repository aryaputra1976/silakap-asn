import { Prisma, LayananStatus } from "@prisma/client"
import { WorkflowValidator } from "../validators/workflow.validator"
import { WorkflowTimelineService } from "../service/workflow.timeline.service"
import { DependencyEngine } from "../../dependency/engine/dependency.engine"
import { SLAEngine } from "../../services/sla/engine/sla.engine"

export class WorkflowEngine {

  static async transition(
    tx: Prisma.TransactionClient,
    usulId: bigint,
    jenisLayananId: bigint,
    currentStatus: LayananStatus,
    actionCode: string,
    role?: string
  ) {

    /**
     * RESOLVE TRANSITION
     */
    const transition =
      await tx.silakapWorkflowTransition.findFirst({
        where: {
          jenisLayananId,
          fromState: currentStatus,
          actionCode
        }
      })

    if (!transition) {
      throw new Error(
        `Workflow action tidak valid: ${currentStatus} → ${actionCode}`
      )
    }

    const nextStatus = transition.toState

    /**
     * VALIDASI ROLE
     */
    if (transition.role) {

      if (!role) {
        throw new Error("Role required for this transition")
      }

      if (transition.role !== role) {
        throw new Error(
          `Role ${role} tidak diizinkan melakukan transisi`
        )
      }

    }

    /**
     * VALIDATOR TAMBAHAN
     */
    await WorkflowValidator.beforeTransition(
      tx,
      usulId,
      currentStatus,
      nextStatus
    )

    /**
     * FINISH SLA
     */
    await SLAEngine.finish(
      tx,
      usulId,
      currentStatus
    )

    /**
     * ATOMIC UPDATE
     */
    const updated =
      await tx.silakapUsulLayanan.updateMany({
        where: {
          id: usulId,
          status: currentStatus
        },
        data: {
          status: nextStatus
        }
      })

    if (!updated.count) {
      throw new Error("Workflow race condition detected")
    }

    /**
     * START SLA
     */
    await SLAEngine.start(
      tx,
      usulId,
      jenisLayananId,
      nextStatus
    )

    /**
     * TRIGGER DEPENDENCY
     */
    await DependencyEngine.trigger(
      tx,
      jenisLayananId,
      nextStatus,
      usulId
    )

    /**
     * RECORD TIMELINE
     */
    await WorkflowTimelineService.create(
      tx,
      usulId,
      currentStatus,
      nextStatus
    )

    /**
     * RETURN RESULT
     */
    return {
      usulId,
      fromStatus: currentStatus,
      toStatus: nextStatus
    }

  }

}