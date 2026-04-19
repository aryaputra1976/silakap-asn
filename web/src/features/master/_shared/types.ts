export type MasterEntity = {
  id: bigint
  kode: string
  nama: string
  isActive: boolean
}

export type SortOrder = "asc" | "desc"

export type StatusFilter = "" | "active" | "inactive"

export type MasterQueryParams = {
  page: number
  limit: number
  search?: string
  sort?: string
  order?: SortOrder
  status?: StatusFilter
}

export type MasterListResponse<T = MasterEntity> = {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages?: number
  }
}

/**
 * Create payload untuk semua master generic
 */
export type CreateMasterPayload = {
  kode: string
  nama: string
}

/**
 * Update payload — kode boleh optional
 * (karena beberapa master bisa protect kode)
 */
export type UpdateMasterPayload = {
  kode?: string
  nama?: string
}

export type MasterColumn<T> = {
  key: keyof T | string
  title: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
}