import { Injectable } from '@nestjs/common'
import { LayananStatus, Prisma } from '@prisma/client'

import { BusinessError } from '@/core/errors/business.error'
import { PrismaService } from '@/prisma/prisma.service'

import { CompletenessService } from '../completeness/completeness.service'
import { ServicesRegistry } from '../registry/services.registry'

import { ServicesDependencyService } from './service/services.dependency.service'
import { ServicesWorkflowGuard } from './service/services.workflow.guard'
import { ServicesWorkflowService } from './service/services.workflow.service'

@Injectable()
export class ServicesEngine {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowService: ServicesWorkflowService,
    private readonly dependencyService: ServicesDependencyService,
    private readonly workflowGuard: ServicesWorkflowGuard,
    private readonly completenessService: CompletenessService,
  ) {}

  async createDetail(params: {
    usulId: bigint
    jenisKode: string
    payload?: unknown
  }) {
    const { usulId, jenisKode, payload } = params

    return this.prisma.$transaction(async (tx) => {
      const handler = ServicesRegistry.resolve(jenisKode as never)

      if (!handler?.createDetail) {
        throw new BusinessError(
          'SERVICE_DETAIL_NOT_SUPPORTED',
          `Service ${jenisKode} tidak mendukung createDetail`,
        )
      }

      await handler.createDetail(tx, usulId, payload)

      return {
        usulId,
        detailCreated: true,
      }
    })
  }

  async execute(
    tx: Prisma.TransactionClient,
    params: {
      usulId: bigint
      pegawaiId: bigint
      jenisLayananId: bigint
      actionCode: string
      actorRoleIds?: bigint[]
      actorUserId?: bigint
      jenisKode?: string
    },
  ) {
    const {
      usulId,
      pegawaiId,
      jenisLayananId,
    } = params

    const action = params.actionCode.toUpperCase()

    try {
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
          'Usul layanan tidak ditemukan',
        )
      }

      const usul = rows[0]

      const handler = params.jenisKode
        ? ServicesRegistry.tryResolve(params.jenisKode)
        : null

      await this.dependencyService.validateDependencies(tx, usulId)

      const validated = await this.workflowGuard.validateForExecution(tx, {
        ...params,
        actionCode: action,
      })

      const completeness =
        await this.completenessService.calculateByPegawai(
          tx,
          pegawaiId,
          jenisLayananId,
        )

      if (!completeness.isComplete) {
        throw new BusinessError(
          'DATA_NOT_COMPLETE',
          `Dokumen belum lengkap: ${completeness.missing.join(', ')}`,
        )
      }

      if (action === 'SUBMIT' && handler?.validateSubmit) {
        await handler.validateSubmit(tx, usulId)
      }

      // matchedRoleId hanya terisi pada transisi yang memerlukan role tertentu.
      // Pada transisi bebas-role, roleId log dikosongkan agar tidak menyimpan nilai acak.
      const actorRoleId = validated.matchedRoleId ?? undefined

      const result = await this.workflowService.transition(tx, {
        usulId,
        currentStatus: usul.status,
        actionCode: action,
        actorUserId: params.actorUserId,
        actorRoleId,
        jenisLayananId,
      })

      if (action === 'SUBMIT' && handler?.afterSubmit) {
        await handler.afterSubmit(tx, usulId)
      }

      if (handler?.afterTransition) {
        await handler.afterTransition(tx, usulId, action)
      }

      return result
    } catch (error: unknown) {
      if (error instanceof BusinessError) {
        throw error
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Workflow engine execution error'

      throw new BusinessError(
        'ENGINE_EXECUTION_FAILED',
        message,
      )
    }
  }
}