import type { ServiceStatus } from "@/features/services/base/types/service.types"

export interface UniversalQueueFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  jenis?: string
}

export interface UniversalQueueItem {
  id: number
  status: ServiceStatus
  currentStepCode?: string | null
  currentRoleCode?: string | null
  tanggalUsul: string
  submittedAt?: string | null
  slaDeadline?: string | null
  requiresSeniorReview: boolean
  isOverdue: boolean
  ageDays: number
  pegawai: {
    id: number
    nip: string
    nama: string
  }
  jenis: {
    id: number
    nama: string
    kode: string
  }
  activeAssignment?: {
    assignedRoleCode: string
    assignedAt: string
  } | null
}

export interface UniversalQueueMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  summary: {
    total: number
    overdue: number
    seniorReview: number
  }
  serviceOptions: Array<{
    kode: string
    nama: string
  }>
}

export interface UniversalQueueResponse {
  data: UniversalQueueItem[]
  meta: UniversalQueueMeta
}
