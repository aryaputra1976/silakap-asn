import { Prisma, LayananStatus } from '@prisma/client'
import { BusinessError } from '@/core/errors/business.error'

export class ServicesWorkflowGuard {

  async validate(
    tx: Prisma.TransactionClient,
    usulId: bigint,
    actionCode: string,
    actorRoleId?: bigint
  ) {

    const normalizedAction = actionCode.toUpperCase()

    const usul = await tx.silakapUsulLayanan.findUnique({
      where: { id: usulId },
      select: {
        id: true,
        status: true,
        jenisLayananId: true
      }
    })

    if (!usul) {
      throw new BusinessError(
        'USUL_NOT_FOUND',
        'Usul tidak ditemukan'
      )
    }

    const transition =
      await tx.silakapWorkflowTransition.findFirst({

        where: {
          jenisLayananId: usul.jenisLayananId,
          fromState: usul.status,
          actionCode: normalizedAction
        },

        select: {
          id: true,
          fromState: true,
          toState: true,
          role: true
        }

      })

    if (!transition) {

      throw new BusinessError(
        'WORKFLOW_NOT_FOUND',
        `Workflow tidak ditemukan: jenisLayananId=${usul.jenisLayananId}, fromState=${usul.status}, action=${normalizedAction}`
      )

    }

    /**
     * ROLE VALIDATION
     */
    if (transition.role) {

      if (!actorRoleId) {
        throw new BusinessError(
          'ROLE_REQUIRED',
          'Role diperlukan untuk aksi ini'
        )
      }

      const role = await tx.silakapRole.findUnique({
        where: { id: actorRoleId },
        select: { name: true }
      })

      if (!role) {
        throw new BusinessError(
          'ROLE_NOT_FOUND',
          'Role tidak ditemukan'
        )
      }

      if (
        role.name.toUpperCase() !==
        transition.role.toUpperCase()
      ) {
        throw new BusinessError(
          'FORBIDDEN',
          `Role ${role.name} tidak diizinkan`
        )
      }

    }

    return transition

  }

  async validateTransition(
    tx: Prisma.TransactionClient,
    jenisLayananId: bigint,
    currentState: LayananStatus,
    nextState: LayananStatus
  ) {

    const rule = await tx.silakapWorkflowTransition.findFirst({

      where: {
        jenisLayananId,
        fromState: currentState,
        toState: nextState
      },

      select: { id: true }

    })

    if (!rule) {

      throw new BusinessError(
        'INVALID_WORKFLOW_TRANSITION',
        `Transisi ${currentState} → ${nextState} tidak diizinkan`
      )

    }

    return true

  }

  async validateForExecution(
    tx: Prisma.TransactionClient,
    params: {
      usulId: bigint
      pegawaiId: bigint
      jenisLayananId: bigint
      actionCode: string
      actorRoleId?: bigint
    }
  ) {

    const transition = await this.validate(
      tx,
      params.usulId,
      params.actionCode,
      params.actorRoleId
    )

    await this.validateTransition(
      tx,
      params.jenisLayananId,
      transition.fromState,
      transition.toState
    )

    return transition

  }

}