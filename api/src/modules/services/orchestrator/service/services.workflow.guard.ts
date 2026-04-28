import { Injectable } from '@nestjs/common'
import { LayananStatus, Prisma } from '@prisma/client'

import { BusinessError } from '@/core/errors/business.error'

@Injectable()
export class ServicesWorkflowGuard {
  async validate(
    tx: Prisma.TransactionClient,
    usulId: bigint,
    actionCode: string,
    actorRoleIds?: bigint[],
  ): Promise<{
    id: bigint
    fromState: LayananStatus
    toState: LayananStatus
    role: string | null
    matchedRoleId?: bigint
  }> {
    const normalizedAction = actionCode.toUpperCase()

    const usul = await tx.silakapUsulLayanan.findUnique({
      where: { id: usulId },
      select: {
        id: true,
        status: true,
        jenisLayananId: true,
      },
    })

    if (!usul) {
      throw new BusinessError(
        'USUL_NOT_FOUND',
        'Usul tidak ditemukan',
      )
    }

    const transition =
      await tx.silakapWorkflowTransition.findFirst({
        where: {
          jenisLayananId: usul.jenisLayananId,
          fromState: usul.status,
          actionCode: normalizedAction,
        },
        select: {
          id: true,
          fromState: true,
          toState: true,
          role: true,
        },
      })

    if (!transition) {
      throw new BusinessError(
        'WORKFLOW_NOT_FOUND',
        `Workflow tidak ditemukan: jenisLayananId=${usul.jenisLayananId}, fromState=${usul.status}, action=${normalizedAction}`,
      )
    }

    let matchedRoleId: bigint | undefined

    if (transition.role) {
      if (!actorRoleIds?.length) {
        throw new BusinessError(
          'ROLE_REQUIRED',
          'Role diperlukan untuk aksi ini',
        )
      }

      const roles = await tx.silakapRole.findMany({
        where: { id: { in: actorRoleIds } },
        select: { id: true, name: true },
      })

      const matched = roles.find(
        (r) =>
          r.name.toUpperCase() ===
          transition.role!.toUpperCase(),
      )

      if (!matched) {
        const names = roles.map((r) => r.name).join(', ')
        throw new BusinessError(
          'FORBIDDEN',
          `Role [${names}] tidak diizinkan untuk aksi ${normalizedAction}`,
        )
      }

      matchedRoleId = matched.id
    }

    return { ...transition, matchedRoleId }
  }

  async validateTransition(
    tx: Prisma.TransactionClient,
    jenisLayananId: bigint,
    currentState: LayananStatus,
    nextState: LayananStatus,
  ) {
    const rule = await tx.silakapWorkflowTransition.findFirst({
      where: {
        jenisLayananId,
        fromState: currentState,
        toState: nextState,
      },
      select: { id: true },
    })

    if (!rule) {
      throw new BusinessError(
        'INVALID_WORKFLOW_TRANSITION',
        `Transisi ${currentState} → ${nextState} tidak diizinkan`,
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
      actorRoleIds?: bigint[]
    },
  ) {
    const transition = await this.validate(
      tx,
      params.usulId,
      params.actionCode,
      params.actorRoleIds,
    )

    await this.validateTransition(
      tx,
      params.jenisLayananId,
      transition.fromState,
      transition.toState,
    )

    return transition
  }
}
