import { Prisma, LayananStatus } from '@prisma/client'
import { prisma } from '@/core/prisma/prisma.client'

import { ServicesWorkflowService } from './service/services.workflow.service'
import { ServicesDependencyService } from './service/services.dependency.service'
import { ServicesWorkflowGuard } from './service/services.workflow.guard'
import { CompletenessService } from '../completeness/completeness.service'
import { ServicesRegistry } from '../registry/services.registry'

import { BusinessError } from '@/core/errors/business.error'

export class ServicesEngine {

  private workflowService = new ServicesWorkflowService()
  private dependencyService = new ServicesDependencyService()
  private workflowGuard = new ServicesWorkflowGuard()
  private completenessService = new CompletenessService()

  /**
   * CREATE SERVICE DETAIL
   */
  async createDetail(
    params: {
      usulId: bigint
      jenisKode: string
      payload?: unknown
    }
  ) {

    const { usulId, jenisKode, payload } = params

    return prisma.$transaction(async (tx) => {

      const handler = ServicesRegistry.resolve(jenisKode as any)

      if (!handler?.createDetail) {
        throw new BusinessError(
          'SERVICE_DETAIL_NOT_SUPPORTED',
          `Service ${jenisKode} tidak mendukung createDetail`
        )
      }

      await handler.createDetail(
        tx,
        usulId,
        payload
      )

      return {
        usulId,
        detailCreated: true
      }

    })

  }

  /**
   * WORKFLOW EXECUTION
   */
  async execute(
    tx: Prisma.TransactionClient,
    params: {
      usulId: bigint
      pegawaiId: bigint
      jenisLayananId: bigint
      actionCode: string
      actorRoleId?: bigint
      actorUserId?: bigint
    }
  ) {

    const {
      usulId,
      pegawaiId,
      jenisLayananId,
      actorRoleId
    } = params

    const action = params.actionCode.toUpperCase()

    try {

      /**
       * HARD LOCK
       */
      const rows = await tx.$queryRaw<
        { id: bigint; status: LayananStatus }[]
      >`
        SELECT id, status
        FROM silakap_usul_layanan
        WHERE id = ${usulId}
        FOR UPDATE
      `

      if (!rows.length) {
        throw new BusinessError(
          'USUL_NOT_FOUND',
          'Usul layanan tidak ditemukan'
        )
      }

      const usul = rows[0]

      /**
       * VALIDASI DEPENDENCY
       */
      await this.dependencyService.validateDependencies(
        tx,
        usulId
      )

      /**
       * VALIDASI WORKFLOW
       */
      const transition =
        await this.workflowGuard.validateForExecution(
          tx,
          {
            ...params,
            actionCode: action
          }
        )

      /**
       * VALIDASI KELENGKAPAN DOKUMEN
       */
      const completeness =
        await this.completenessService.calculateByPegawai(
          tx,
          pegawaiId,
          jenisLayananId
        )

      if (!completeness.isComplete) {

        throw new BusinessError(
          'DATA_NOT_COMPLETE',
          `Dokumen belum lengkap: ${completeness.missing.join(', ')}`
        )

      }

      /**
       * EXECUTE WORKFLOW
       */
      return await this.workflowService.transition(
        tx,
        {
          usulId,
          currentStatus: usul.status,
          actionCode: action,
          actorUserId: params.actorUserId,
          actorRoleId,
          jenisLayananId
        }
      )

    } catch (err: unknown) {

      if (err instanceof BusinessError) {
        throw err
      }

      const message =
        err instanceof Error
          ? err.message
          : 'Workflow engine execution error'

      throw new BusinessError(
        'ENGINE_EXECUTION_FAILED',
        message
      )

    }

  }

}
