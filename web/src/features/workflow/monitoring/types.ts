import type { ServiceStatus } from "@/features/services/base/types/service.types"

export interface WorkflowMonitoringSla {
  overdue: number
  warning: number
  compliance: number
}

export interface WorkflowMonitoringBottleneckItem {
  status: ServiceStatus
  total: number
}

export interface WorkflowMonitoringLongestItem {
  id: number | string
  status: ServiceStatus
  tanggalUsul: string
  jenis?: {
    nama?: string | null
  } | null
  pegawai?: {
    nama?: string | null
  } | null
}

export interface WorkflowMonitoringResponse {
  sla: WorkflowMonitoringSla
  bottleneck: WorkflowMonitoringBottleneckItem[]
  longestProcess: WorkflowMonitoringLongestItem[]
}
