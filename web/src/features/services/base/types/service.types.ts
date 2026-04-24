import { ComponentType } from "react"

export type ServiceStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "VERIFIED"
  | "RETURNED"
  | "APPROVED"
  | "REJECTED"
  | "SYNCED_SIASN"
  | "FAILED_SIASN"
  | "COMPLETED"

export interface ServiceItem {
  id: string
  nama: string
  nip: string
  unitKerja?: string
  jabatan?: string
  jenis?: string
  status: ServiceStatus
  createdAt?: string
}

export interface ServiceListResponse {
  data: Array<{
    id: string | number
    status: ServiceStatus
    createdAt?: string
    pegawai?: {
      id?: string | number
      nip?: string
      nama?: string
    } | null
    jenis?: {
      id?: string | number
      nama?: string
      kode?: string
    } | null
  }>
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ServiceChecklistItem {
  itemCode: string
  itemLabel: string
  itemCategory?: string
  isRequired: boolean
  isChecked: boolean
  note?: string | null
}

export interface ServiceValidationIssue {
  issueCode: string
  issueLabel: string
  severity: string
  source: string
  isResolved: boolean
  note?: string | null
}

export interface ServicePensiunDetail {
  jenis?: {
    kode?: string
    nama?: string
  } | null
  tmtPensiun?: string
  jabatanSnapshot?: string | null
  unitKerjaSnapshot?: string | null
  golonganSnapshot?: string | null
  perhitungan?: {
    masaKerjaTahun?: number | null
    masaKerjaBulan?: number | null
    gajiPokok?: string | number | null
    estimasiPensiun?: string | number | null
  } | null
}

export interface ServiceJabatanDetail {
  proposedJenisJabatan?: string | null
  proposedJabatan?: string | null
  proposedTmtJabatan?: string | null
  proposedNomorSk?: string | null
  currentJenisJabatan?: string | null
  currentJabatan?: string | null
  currentTmtJabatan?: string | null
  currentNomorSk?: string | null
  isApplied?: boolean
}

export interface ServiceDetailResponse {
  id: string | number
  status: ServiceStatus
  currentStepCode?: string | null
  currentRoleCode?: string | null
  pegawai?: {
    id?: string | number
    nip?: string
    nama?: string
  } | null
  jenis?: {
    id?: string | number
    nama?: string
    kode?: string
  } | null
  layananLog?: Array<{
    status: string
    fromStatus?: string | null
    toStatus?: string | null
    actionCode?: string | null
    createdAt: string
    keterangan?: string | null
  }>
  workflowTimeline?: Array<{
    fromStatus?: string | null
    toStatus?: string | null
    actionCode?: string | null
    createdAt: string
  }>
  availableActions?: Array<{
    actionCode: string
    role?: string | null
    roleRequired?: string | null
    toState: ServiceStatus | string
    toStepCode?: string | null
    orderNo?: number | null
  }>
  dokumenUsul?: unknown[]
  checklistUsul?: ServiceChecklistItem[]
  validasiIssues?: ServiceValidationIssue[]
  pensiunDetail?: ServicePensiunDetail | null
  jabatanDetail?: ServiceJabatanDetail | null
}

export interface ServiceTimeline {
  status: ServiceStatus | string
  tanggal: string
  user?: string
  keterangan?: string
  source?: "log" | "timeline"
}

export interface ServiceDetailView {
  id: string
  status: ServiceStatus
  currentStepCode?: string
  currentRoleCode?: string
  pegawaiId?: string
  jenisLayananId?: string
  nama: string
  nip: string
  availableActions: Array<{
    actionCode: string
    role?: string | null
    toState: ServiceStatus | string
    toStepCode?: string | null
  }>
  timeline: ServiceTimeline[]
  checklistItems: ServiceChecklistItem[]
  validationIssues: ServiceValidationIssue[]
  pensiunDetail?: ServicePensiunDetail | null
  jabatanDetail?: ServiceJabatanDetail | null
}

export interface ServiceDokumen {
  id: string
  code?: string
  nama: string
  url: string
  uploadedAt?: string
}

export interface ServiceConfig {
  service: string
  title: string
  form: ComponentType<any>
}
