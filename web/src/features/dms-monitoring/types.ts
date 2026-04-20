export type DmsImportStatus =
  | "DRAFT"
  | "IMPORTED"
  | "PARTIAL"
  | "FAILED"

export interface DmsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface DmsBatchItem {
  id: string
  namaFile: string
  unorId: string | null
  unorNama: string | null
  periodeLabel: string | null
  status: DmsImportStatus
  totalRows: number
  successRows: number
  failedRows: number
  catatan: string | null
  importedBy: string | null
  importedByUsername: string | null
  importedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface DmsBatchListResponse {
  data: DmsBatchItem[]
  pagination: DmsPagination
}

export interface DmsBatchSummaryAggregate {
  totalAsn: number
  matchedPegawai: number
  matchedUnor: number
  avgSkorArsip: number | null
  latestSync: string | null
}

export interface DmsKategoriCountItem {
  kategori: string | null
  total: number
}

export interface DmsDokumenStats {
  drh: number
  cpns: number
  d2np: number
  spmt: number
  pns: number
}

export interface DmsBatchSummaryResponse {
  summary: DmsBatchSummaryAggregate
  byKategori: DmsKategoriCountItem[]
  dokumenStats: DmsDokumenStats
}

export interface DmsSnapshotItem {
  id: string
  batchId: string
  pegawaiId: string | null
  nip: string
  namaSnapshot: string
  unorId: string | null
  unorNama: string | null
  unitKerjaRaw: string | null
  drh: boolean
  cpns: boolean
  d2np: boolean
  spmt: boolean
  pns: boolean
  skorArsip: number | null
  kategoriKelengkapan: string | null
  lastSync: string | null
  isMatchedPegawai: boolean
  isMatchedUnor: boolean
  createdAt: string
  updatedAt: string
}

export interface DmsSnapshotListResponse {
  data: DmsSnapshotItem[]
  pagination: DmsPagination
}

export interface DmsDashboardByUnorItem {
  unorId: string | null
  unorNama: string | null
  totalAsn: number
  avgSkorArsip: number | null
  latestSync: string | null
}

export interface DmsDashboardResponse {
  summary: DmsBatchSummaryAggregate
  byKategori: DmsKategoriCountItem[]
  dokumenStats: DmsDokumenStats
  byUnor: DmsDashboardByUnorItem[]
}

export interface DmsBatchFilters {
  page?: number
  limit?: number
  unorId?: string
  status?: DmsImportStatus | ""
}

export interface DmsSnapshotFilters {
  page?: number
  limit?: number
  batchId?: string
  unorId?: string
  kategori?: string
  nip?: string
}

export interface DmsDashboardFilters {
  unorId?: string
}

export interface CreateDmsBatchPayload {
  namaFile: string
  unorId?: string
  periodeLabel?: string
  catatan?: string
}

export interface ImportDmsBatchPayload {
  file: File
  batchId?: string
  unorId?: string
  periodeLabel?: string
  catatan?: string
}

export interface DmsImportErrorItem {
  rowNumber: number
  nip: string
  message: string
}

export interface DmsImportResult {
  batch: DmsBatchItem
  summary: DmsBatchSummaryResponse
  imported: {
    totalRows: number
    successRows: number
    failedRows: number
    status: DmsImportStatus
    errors: DmsImportErrorItem[]
  }
}

export interface DmsOptionItem {
  label: string
  value: string
}