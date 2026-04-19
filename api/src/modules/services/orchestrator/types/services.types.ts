import { LayananStatus } from '@prisma/client'
import { ServiceCode } from '../../registry/services.registry'

export interface CreateUsulDTO {
  pegawaiId: bigint
  jenisLayananId: bigint
  jenisKode: ServiceCode
  payload?: Record<string, unknown>
}

export interface SubmitUsulDTO {
  usulId: bigint
}

export interface WorkflowActionDTO {
  usulId: bigint
  actionCode: string
  actorRoleId?: bigint
}

export interface QueryUsulDTO {
  pegawaiId?: bigint
  jenisLayananId?: bigint
  status?: LayananStatus
  page?: number
  limit?: number
}