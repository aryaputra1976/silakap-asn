import type { ServiceStatus } from "@/features/services/base/types/service.types"

export type DisposisiStatus = "SENT" | "ACCEPTED" | "DONE"

export interface DisposisiFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export interface DisposisiItem {
  id: number
  status: DisposisiStatus
  isActive: boolean
  note?: string | null
  createdAt: string
  completedAt?: string | null
  toRoleCode?: string | null
  usul: {
    id: number
    status: ServiceStatus
    pegawai: {
      id: number
      nip: string
      nama: string
    } | null
    jenis: {
      id: number
      kode: string
      nama: string
    } | null
  }
}

export interface DisposisiMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  summary: {
    total: number
    sent: number
    accepted: number
    done: number
  }
}

export interface DisposisiResponse {
  data: DisposisiItem[]
  meta: DisposisiMeta
}
