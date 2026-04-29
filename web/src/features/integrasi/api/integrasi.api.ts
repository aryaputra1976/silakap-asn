import http, {
  getRequest,
  patchRequest,
  postRequest,
} from "@/core/http/httpClient"
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

type IntegrasiRequestConfig = {
  signal?: AbortSignal
}

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

export function getImportBatches(
  query: ImportBatchQuery,
  config?: IntegrasiRequestConfig,
) {
  return getRequest<PaginatedResponse<ImportBatchItem>>(
    `/integrasi/import/pegawai/batches${toQueryString(query)}`,
    config,
  )
}

export async function exportImportBatchesCsv(
  query: ImportBatchQuery,
  config?: IntegrasiRequestConfig,
) {
  const response = await http.get<Blob>(
    `/integrasi/import/pegawai/batches/export${toQueryString(query)}`,
    {
      signal: config?.signal,
      responseType: "blob",
    },
  )

  return response.data
}

export function getImportBatchDetail(
  batchId: string,
  config?: IntegrasiRequestConfig,
) {
  return getRequest<ImportBatchItem>(
    `/integrasi/import/pegawai/batches/${batchId}`,
    config,
  )
}

export function getImportBatchErrors(
  batchId: string,
  query: ImportBatchQuery,
  config?: IntegrasiRequestConfig,
) {
  return getRequest<PaginatedResponse<ImportErrorRow>>(
    `/integrasi/import/pegawai/batches/${batchId}/errors${toQueryString(query)}`,
    config,
  )
}

export function getMissingReferences(
  batchId: string,
  config?: IntegrasiRequestConfig,
) {
  return getRequest<MissingReferencesResponse>(
    `/integrasi/import/pegawai/batches/${batchId}/missing-references`,
    config,
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

export function createMissingPendidikanReferences(batchId: string) {
  return postRequest<CreateReferenceResponse, EmptyBody>(
    `/integrasi/import/pegawai/batches/${batchId}/references/pendidikan`,
    {},
  )
}

export function getIntegrasiLogs(
  query: ImportBatchQuery,
  config?: IntegrasiRequestConfig,
) {
  return getRequest<PaginatedResponse<IntegrasiLogItem>>(
    `/integrasi/logs${toQueryString(query)}`,
    config,
  )
}

export async function exportIntegrasiLogsCsv(
  query: ImportBatchQuery,
  config?: IntegrasiRequestConfig,
) {
  const response = await http.get<Blob>(
    `/integrasi/logs/export${toQueryString(query)}`,
    {
      signal: config?.signal,
      responseType: "blob",
    },
  )

  return response.data
}

export function getIntegrasiLogsSummary(config?: IntegrasiRequestConfig) {
  return getRequest<IntegrasiLogsSummary>("/integrasi/logs/summary", config)
}

export function getIntegrasiLogDetail(
  id: string,
  config?: IntegrasiRequestConfig,
) {
  return getRequest<IntegrasiLogDetail>(`/integrasi/logs/${id}`, config)
}

export function getIntegrasiJobs(
  query: ImportBatchQuery,
  config?: IntegrasiRequestConfig,
) {
  return getRequest<PaginatedResponse<IntegrasiJobItem>>(
    `/integrasi/jobs${toQueryString(query)}`,
    config,
  )
}

export function getIntegrasiJobsSummary(config?: IntegrasiRequestConfig) {
  return getRequest<IntegrasiJobsSummary>("/integrasi/jobs/summary", config)
}

export function getIntegrasiJobDetail(
  batchId: string,
  config?: IntegrasiRequestConfig,
) {
  return getRequest<IntegrasiJobDetail>(`/integrasi/jobs/${batchId}`, config)
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

export function getIntegrasiSiasnSummary(config?: IntegrasiRequestConfig) {
  return getRequest<IntegrasiSiasnSummary>("/integrasi/siasn/summary", config)
}

export function getIntegrasiSiasnStatus(config?: IntegrasiRequestConfig) {
  return getRequest<IntegrasiSiasnStatus>("/integrasi/siasn/status", config)
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

export function getIntegrasiLogRows(
  id: string,
  query: IntegrasiLogRowsQuery,
  config?: IntegrasiRequestConfig,
) {
  return getRequest<PaginatedResponse<ImportErrorRow>>(
    `/integrasi/logs/${id}/rows${toLogRowsQueryString(query)}`,
    config,
  )
}

export function runIntegrasiCancelJob(batchId: string) {
  return postRequest<RunIntegrasiJobResponse, EmptyBody>(
    `/integrasi/jobs/import-batches/${batchId}/cancel`,
    {},
  )
}

export function updateImportRow(
  batchId: string,
  rowId: string,
  payload: UpdateImportRowPayload,
) {
  return patchRequest<ImportErrorRow, UpdateImportRowPayload>(
    `/integrasi/import/pegawai/batches/${batchId}/rows/${rowId}`,
    payload,
  )
}
