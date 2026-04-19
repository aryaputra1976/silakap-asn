import { ComponentType } from "react"

export type ServiceStatus =
  | "DRAFT"
  | "SUBMITTED"
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

export interface ServiceDetailResponse {
  id: string | number
  status: ServiceStatus
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
    createdAt: string
    keterangan?: string | null
  }>
  dokumenUsul?: unknown[]
}

export interface ServiceDetailView {
  id: string
  status: ServiceStatus
  pegawaiId?: string
  jenisLayananId?: string
  nama: string
  nip: string
  timeline: ServiceTimeline[]
}

export interface ServiceTimeline {

  status: ServiceStatus | string

  tanggal: string

  user?: string
  keterangan?: string

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
