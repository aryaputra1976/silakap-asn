export type IntegrasiBatchStatus =
  | "DRAFT"
  | "VALIDATED"
  | "VALIDATED_WITH_ERROR"
  | "IMPORTED"
  | string

export type PaginatedResponse<T> = {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type ImportBatchQuery = {
  page?: number
  limit?: number
  q?: string
  status?: string
  type?: string
}

export type ImportBatchItem = {
  id: string
  batchCode: string
  fileName: string
  totalRows: number
  validRows: number
  invalidRows: number
  importedRows: number
  status: IntegrasiBatchStatus
  errors: unknown
  createdAt: string
  updatedAt: string
}

export type ImportErrorRow = {
  id: string
  batchId: string
  rowNumber: number
  nip: string | null
  nik: string | null
  nama: string | null
  siasnId: string | null
  rawData: unknown
  mappedData: unknown
  errors: unknown
  isValid: boolean
  isImported: boolean
  createdAt: string
  updatedAt: string
}

export type MissingReferenceItem = {
  value: string
  name: string | null
  count: number
  sampleRows: number[]
}

export type MissingReferencesResponse = {
  jabatan: MissingReferenceItem[]
  unor: MissingReferenceItem[]
  pendidikan: MissingReferenceItem[]
}

export type ValidateBatchResponse = {
  batchId: string
  totalRows: number
  validRows: number
  invalidRows: number
  status: string
}

export type CommitBatchResponse = {
  batchId: string
  importedRows: number
  status?: string
  message?: string
}

export type CreateReferenceResponse = {
  batchId: string
  referenceType: "jabatan" | "unor" | "pendidikan"
  created: number
  skipped: number
  message?: string
}

export type IntegrasiLogItem = {
  id: string
  type: string
  title: string
  batchCode: string
  fileName: string
  status: string
  totalRows: number
  validRows: number
  invalidRows: number
  importedRows: number
  hasError: boolean
  createdAt: string
  updatedAt: string
}

export type IntegrasiLogDetail = IntegrasiLogItem & {
  errors: unknown
  rows: ImportErrorRow[]
}

export type IntegrasiLogsSummary = {
  totalBatches: number
  draftBatches: number
  validatedBatches: number
  errorBatches: number
  importedBatches: number
  totalRows: number
  validRows: number
  invalidRows: number
  importedRows: number
}

export type IntegrasiJobItem = {
  id: string
  type: string
  name: string
  batchCode: string
  fileName: string
  status: string
  progress: number
  totalRows: number
  validRows: number
  invalidRows: number
  importedRows: number
  hasError: boolean
  createdAt: string
  updatedAt: string
}

export type IntegrasiJobDetail = IntegrasiJobItem & {
  errors: unknown
  availableActions: string[]
}

export type IntegrasiJobsSummary = {
  totalJobs: number
  draftJobs: number
  validatedJobs: number
  errorJobs: number
  importedJobs: number
  totalRows: number
  validRows: number
  invalidRows: number
  importedRows: number
}

export type RunIntegrasiJobResponse = {
  jobId: string
  type: string
  status: string
  result: unknown
}

export type IntegrasiSiasnSummary = {
  pegawai: {
    total: number
    active: number
    inactive: number
    withSiasnId: number
    withoutSiasnId: number
    siasnCoveragePercent: number
  }
  sync: {
    status: "HEALTHY" | "WARNING" | "PARTIAL" | string
    latestSyncedPegawai: {
      id: string
      nip: string
      nama: string
      siasnId: string | null
      lastSyncedAt: string | null
      syncSource: string | null
    } | null
    latestImportBatch: {
      id: string
      batchCode: string
      fileName: string
      totalRows: number
      validRows: number
      invalidRows: number
      importedRows: number
      status: string
      createdAt: string
      updatedAt: string
    } | null
    failedImportBatches: number
    importedBatches: number
  }
}

export type IntegrasiSiasnStatus = {
  status: "HEALTHY" | "WARNING" | "PARTIAL" | string
  message: string
  checkedAt: string
}