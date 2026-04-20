import type { DmsOptionItem } from "../types"

export const DMS_STATUS_OPTIONS: DmsOptionItem[] = [
  { label: "Semua status", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Imported", value: "IMPORTED" },
  { label: "Partial", value: "PARTIAL" },
  { label: "Failed", value: "FAILED" },
]

export const DMS_BATCH_LIMIT_OPTIONS: DmsOptionItem[] = [
  { label: "10 / halaman", value: "10" },
  { label: "20 / halaman", value: "20" },
  { label: "50 / halaman", value: "50" },
  { label: "100 / halaman", value: "100" },
]

export const DMS_SNAPSHOT_LIMIT_OPTIONS: DmsOptionItem[] = [
  { label: "10 / halaman", value: "10" },
  { label: "20 / halaman", value: "20" },
  { label: "50 / halaman", value: "50" },
  { label: "100 / halaman", value: "100" },
]