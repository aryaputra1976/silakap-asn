import { getRequest, patchRequest, postRequest } from "@/core/http/httpClient"
import type {
  CommitBatchResponse,
  CreateReferenceResponse,
  ImportBatchItem,
  ImportBatchQuery,
  ImportErrorRow,
  IntegrasiJobDetail,
  IntegrasiJobItem,
  IntegrasiJobsSummary,
  IntegrasiLogDetail,
  IntegrasiLogItem,
  IntegrasiLogsSummary,
  IntegrasiSiasnStatus,
  IntegrasiSiasnSummary,
  MissingReferencesResponse,
  PaginatedResponse,
  RunIntegrasiJobResponse,
  UploadImportPegawaiResponse,
  IntegrasiLogRowsQuery,
  ValidateBatchResponse,
} from "../types"

export type UpdateImportRowPayload = {
  nip: string
  nik: string
  nama: string
  siasnId: string
}

export type ReferenceImportKind =
  | "jabatan-fungsional"
  | "jabatan-pelaksana"
  | "jabatan-struktural"
  | "unor"

export type ReferenceImportResponse = {
  type: string
  jenis?: string
  fileName: string
  totalRows: number
  validRows: number
  created: number
  updated: number
  skipped: number
}

export type ReferenceImportConfig = {
  kind: ReferenceImportKind
  endpoint: string
  title: string
  shortTitle: string
  description: string
  helper: string
}

export const REFERENCE_IMPORT_CONFIGS = [
  {
    kind: "jabatan-fungsional",
    endpoint: "/integrasi/import/referensi/jabatan/fungsional",
    title: "Jabatan Fungsional",
    shortTitle: "Fungsional",
    description: "Referensi jabatan fungsional resmi untuk master ref_jabatan.",
    helper: "Gunakan file Referensi-Jabatan-Fungsional.xlsx.",
  },
  {
    kind: "jabatan-pelaksana",
    endpoint: "/integrasi/import/referensi/jabatan/pelaksana",
    title: "Jabatan Pelaksana",
    shortTitle: "Pelaksana",
    description: "Referensi jabatan pelaksana resmi untuk master ref_jabatan.",
    helper: "Gunakan file Referensi-Jabatan-Pelaksana.xlsx.",
  },
  {
    kind: "jabatan-struktural",
    endpoint: "/integrasi/import/referensi/jabatan/struktural",
    title: "Jabatan Struktural",
    shortTitle: "Struktural",
    description: "Referensi jabatan struktural resmi untuk master ref_jabatan.",
    helper: "Gunakan file Referensi-Jabatan-Struktural.xlsx.",
  },
  {
    kind: "unor",
    endpoint: "/integrasi/import/referensi/unor",
    title: "UNOR",
    shortTitle: "UNOR",
    description: "Referensi unit organisasi resmi untuk master ref_unor.",
    helper: "Gunakan file Referensi-unor.xlsx.",
  },
] as const satisfies readonly ReferenceImportConfig[]

export function getReferenceImportConfig(
  kind: ReferenceImportKind,
): ReferenceImportConfig {
  return (
    REFERENCE_IMPORT_CONFIGS.find((item) => item.kind === kind) ??
    REFERENCE_IMPORT_CONFIGS[0]
  )
}

export function getReferenceImportEndpoint(kind: ReferenceImportKind): string {
  return getReferenceImportConfig(kind).endpoint
}

export function uploadReferenceImportFile(
  kind: ReferenceImportKind,
  file: File,
) {
  const formData = new FormData()
  formData.append("file", file)

  return postRequest<ReferenceImportResponse, FormData>(
    getReferenceImportEndpoint(kind),
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120_000,
    },
  )
}

type EmptyBody = Record<string, never>

function toQueryString(query: ImportBatchQuery) {
  const params = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).length > 0) {
      params.set(key, String(value))
    }
  })

  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export function getImportBatches(query: ImportBatchQuery) {
  return getRequest<PaginatedResponse<ImportBatchItem>>(
    `/integrasi/import/pegawai/batches${toQueryString(query)}`,
  )
}

export function getImportBatchDetail(batchId: string) {
  return getRequest<ImportBatchItem>(
    `/integrasi/import/pegawai/batches/${batchId}`,
  )
}

export function getImportBatchErrors(batchId: string, query: ImportBatchQuery) {
  return getRequest<PaginatedResponse<ImportErrorRow>>(
    `/integrasi/import/pegawai/batches/${batchId}/errors${toQueryString(query)}`,
  )
}

export function getMissingReferences(batchId: string) {
  return getRequest<MissingReferencesResponse>(
    `/integrasi/import/pegawai/batches/${batchId}/missing-references`,
  )
}

export function validateImportBatch(batchId: string) {
  return postRequest<ValidateBatchResponse, EmptyBody>(
    `/integrasi/import/pegawai/batches/${batchId}/validate`,
    {},
  )
}

export function commitImportBatch(batchId: string) {
  return postRequest<CommitBatchResponse, EmptyBody>(
    `/integrasi/import/pegawai/batches/${batchId}/commit`,
    {},
  )
}

export function createMissingJabatanReferences(batchId: string) {
  return postRequest<CreateReferenceResponse, EmptyBody>(
    `/integrasi/import/pegawai/batches/${batchId}/references/jabatan`,
    {},
  )
}

export function createMissingUnorReferences(batchId: string) {
  return postRequest<CreateReferenceResponse, EmptyBody>(
    `/integrasi/import/pegawai/batches/${batchId}/references/unor`,
    {},
  )
}

export function createMissingPendidikanReferences(batchId: string) {
  return postRequest<CreateReferenceResponse, EmptyBody>(
    `/integrasi/import/pegawai/batches/${batchId}/references/pendidikan`,
    {},
  )
}

export function getIntegrasiLogs(query: ImportBatchQuery) {
  return getRequest<PaginatedResponse<IntegrasiLogItem>>(
    `/integrasi/logs${toQueryString(query)}`,
  )
}

export function getIntegrasiLogsSummary() {
  return getRequest<IntegrasiLogsSummary>("/integrasi/logs/summary")
}

export function getIntegrasiLogDetail(id: string) {
  return getRequest<IntegrasiLogDetail>(`/integrasi/logs/${id}`)
}

export function getIntegrasiJobs(query: ImportBatchQuery) {
  return getRequest<PaginatedResponse<IntegrasiJobItem>>(
    `/integrasi/jobs${toQueryString(query)}`,
  )
}

export function getIntegrasiJobsSummary() {
  return getRequest<IntegrasiJobsSummary>("/integrasi/jobs/summary")
}

export function getIntegrasiJobDetail(batchId: string) {
  return getRequest<IntegrasiJobDetail>(`/integrasi/jobs/${batchId}`)
}

export function runIntegrasiValidateJob(batchId: string) {
  return postRequest<RunIntegrasiJobResponse, EmptyBody>(
    `/integrasi/jobs/import-batches/${batchId}/validate`,
    {},
  )
}

export function runIntegrasiCommitJob(batchId: string) {
  return postRequest<RunIntegrasiJobResponse, EmptyBody>(
    `/integrasi/jobs/import-batches/${batchId}/commit`,
    {},
  )
}

export function getIntegrasiSiasnSummary() {
  return getRequest<IntegrasiSiasnSummary>("/integrasi/siasn/summary")
}

export function getIntegrasiSiasnStatus() {
  return getRequest<IntegrasiSiasnStatus>("/integrasi/siasn/status")
}

function toLogRowsQueryString(query: IntegrasiLogRowsQuery) {
  const params = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).length > 0) {
      params.set(key, String(value))
    }
  })

  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export function uploadImportPegawaiFile(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  return postRequest<UploadImportPegawaiResponse, FormData>(
    "/integrasi/import/pegawai/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120_000,
    },
  )
}

export function cancelImportBatch(batchId: string) {
  return postRequest<CommitBatchResponse, EmptyBody>(
    `/integrasi/import/pegawai/batches/${batchId}/cancel`,
    {},
  )
}

export function getIntegrasiLogRows(id: string, query: IntegrasiLogRowsQuery) {
  return getRequest<PaginatedResponse<ImportErrorRow>>(
    `/integrasi/logs/${id}/rows${toLogRowsQueryString(query)}`,
  )
}

export function runIntegrasiCancelJob(batchId: string) {
  return postRequest<RunIntegrasiJobResponse, EmptyBody>(
    `/integrasi/jobs/import-batches/${batchId}/cancel`,
    {},
  )
}

export function updateImportRow(
  rowId: string,
  payload: UpdateImportRowPayload,
) {
  return patchRequest<ImportErrorRow, UpdateImportRowPayload>(
    `/integrasi/import/pegawai/rows/${rowId}`,
    payload,
  )
}