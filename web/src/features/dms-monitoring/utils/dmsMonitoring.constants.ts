import type {
  DmsBatchFilters,
  DmsImportStatus,
  DmsSnapshotFilters,
} from "../types"

export const DMS_MONITORING_QUERY_KEYS = {
  root: ["dms-monitoring"] as const,
  batches: (filters?: unknown) =>
    ["dms-monitoring", "batches", filters] as const,
  batchDetail: (id: string) =>
    ["dms-monitoring", "batch-detail", id] as const,
  batchSummary: (id: string) =>
    ["dms-monitoring", "batch-summary", id] as const,
  snapshots: (filters?: unknown) =>
    ["dms-monitoring", "snapshots", filters] as const,
  dashboard: (filters?: unknown) =>
    ["dms-monitoring", "dashboard", filters] as const,
} as const

export const DMS_IMPORT_STATUS_ORDER: DmsImportStatus[] = [
  "DRAFT",
  "IMPORTED",
  "PARTIAL",
  "FAILED",
]

export const DMS_DEFAULT_BATCH_FILTERS: DmsBatchFilters = {
  page: 1,
  limit: 10,
  status: "",
  unorId: "",
}

export const DMS_DEFAULT_SNAPSHOT_FILTERS: DmsSnapshotFilters = {
  page: 1,
  limit: 10,
  batchId: "",
  unorId: "",
  kategori: "",
  nip: "",
}

export const DMS_IMPORT_ACCEPT =
  ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xls,application/vnd.ms-excel"
  
