import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import {
  updateImportRow,
  cancelImportBatch,
  uploadImportPegawaiFile,
} from "../api/integrasi.api"
import {
  useCommitIntegrasiBatch,
  useCreateJabatanReferences,
  useCreatePendidikanReferences,
  useCreateUnorReferences,
  useIntegrasiImportBatches,
  useIntegrasiImportErrors,
  useIntegrasiMissingReferences,
  useValidateIntegrasiBatch,
} from "./useIntegrasiImport"
import type { ImportBatchItem, ImportBatchQuery, ImportErrorRow } from "../types"
import type { ImportEditRowPayload } from "../components/import/ImportEditRowModal"

const ACCEPTED_FILE_EXTENSIONS = [".xlsx", ".xls", ".csv"]

type Notice = {
  type: "success" | "error" | "info"
  message: string
}

type LocalAction = "idle" | "uploading" | "cancelling"

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message
  }

  return "Terjadi kesalahan. Silakan coba lagi."
}

function isValidImportFile(file: File): boolean {
  const fileName = file.name.toLowerCase()
  return ACCEPTED_FILE_EXTENSIONS.some((extension) =>
    fileName.endsWith(extension),
  )
}

function normalizeStatus(status: string): string {
  return status.toUpperCase()
}

export function canValidateImportBatch(batch: ImportBatchItem): boolean {
  return ["DRAFT", "VALIDATED_WITH_ERROR", "FAILED"].includes(
    normalizeStatus(batch.status),
  )
}

export function canCommitImportBatch(batch: ImportBatchItem): boolean {
  return normalizeStatus(batch.status) === "VALIDATED" && batch.invalidRows === 0
}

export function canCancelImportBatch(batch: ImportBatchItem): boolean {
  return ["DRAFT", "VALIDATED", "VALIDATED_WITH_ERROR", "FAILED"].includes(
    normalizeStatus(batch.status),
  )
}

export function useIntegrasiImportWorkspace() {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [localAction, setLocalAction] = useState<LocalAction>("idle")

  const [selectedErrorRow, setSelectedErrorRow] = useState<ImportErrorRow | null>(null)
  const [updateRowLoading, setUpdateRowLoading] = useState(false)
  const [updateRowError, setUpdateRowError] = useState<string | null>(null)

  const query: ImportBatchQuery = useMemo(
    () => ({
      page,
      limit: 10,
      q: q.trim() || undefined,
      status: status || undefined,
    }),
    [page, q, status],
  )

  const batchesQuery = useIntegrasiImportBatches(query)
  const batches = batchesQuery.data?.data ?? []
  const meta = batchesQuery.data?.meta

  const selectedBatch = useMemo(() => {
    if (batches.length === 0) return null
    return batches.find((batch) => batch.id === selectedBatchId) ?? batches[0]
  }, [batches, selectedBatchId])

  const errorsQuery = useIntegrasiImportErrors(selectedBatch?.id ?? null, {
    page: 1,
    limit: 25,
  })

  const missingReferencesQuery = useIntegrasiMissingReferences(
    selectedBatch?.id ?? null,
  )

  const validateMutation = useValidateIntegrasiBatch()
  const commitMutation = useCommitIntegrasiBatch()
  const createJabatanMutation = useCreateJabatanReferences()
  const createUnorMutation = useCreateUnorReferences()
  const createPendidikanMutation = useCreatePendidikanReferences()

  useEffect(() => {
    if (!selectedBatchId && batches[0]) {
      setSelectedBatchId(batches[0].id)
    }
  }, [batches, selectedBatchId])

  const summary = useMemo(() => {
    return batches.reduce(
      (acc, item) => ({
        totalRows: acc.totalRows + item.totalRows,
        validRows: acc.validRows + item.validRows,
        invalidRows: acc.invalidRows + item.invalidRows,
        importedRows: acc.importedRows + item.importedRows,
      }),
      {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        importedRows: 0,
      },
    )
  }, [batches])

  const isActionLoading =
    localAction !== "idle" ||
    validateMutation.isPending ||
    commitMutation.isPending ||
    updateRowLoading ||
    createJabatanMutation.isPending ||
    createUnorMutation.isPending ||
    createPendidikanMutation.isPending

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setNotice(null)

    if (!file) {
      setSelectedFile(null)
      return
    }

    if (!isValidImportFile(file)) {
      event.target.value = ""
      setSelectedFile(null)
      setNotice({
        type: "error",
        message: "Format file tidak valid. Gunakan .xlsx, .xls, atau .csv.",
      })
      return
    }

    setSelectedFile(file)
  }

  function handleEditRow(row: ImportErrorRow) {
    setUpdateRowError(null)
    setSelectedErrorRow(row)
  }

  function handleCloseEditRowModal() {
    if (updateRowLoading) return
    setUpdateRowError(null)
    setSelectedErrorRow(null)
  }

async function handleUpdateRow(rowId: string, payload: ImportEditRowPayload) {
  try {
    setUpdateRowLoading(true)
    setUpdateRowError(null)
    setNotice(null)

    await updateImportRow(rowId, payload)
    await errorsQuery.refetch()
    await batchesQuery.refetch()
    await missingReferencesQuery.refetch()

    setSelectedErrorRow(null)

    setNotice({
      type: "success",
      message: "Row staging berhasil diperbaiki. Jalankan validasi ulang untuk memastikan data valid.",
    })
  } catch (error) {
    const message = getErrorMessage(error)
    setUpdateRowError(message)
    setNotice({ type: "error", message })
  } finally {
    setUpdateRowLoading(false)
  }
}

  async function handleUpload() {
    if (!selectedFile) {
      setNotice({
        type: "error",
        message: "Pilih file terlebih dahulu.",
      })
      return
    }

    try {
      setLocalAction("uploading")
      setNotice(null)

      const response = await uploadImportPegawaiFile(selectedFile)
      const refetchResult = await batchesQuery.refetch()

      setSelectedFile(null)
      setSelectedBatchId(response.batchId)

      if (refetchResult.data?.data[0]) {
        setSelectedBatchId(response.batchId)
      }

      setNotice({
        type: "success",
        message: response.message || "File berhasil diupload.",
      })
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) })
    } finally {
      setLocalAction("idle")
    }
  }

  async function handleValidate() {
    if (!selectedBatch) return

    try {
      setNotice(null)
      await validateMutation.mutateAsync(selectedBatch.id)
      await batchesQuery.refetch()
      await errorsQuery.refetch()
      await missingReferencesQuery.refetch()

      setNotice({
        type: "success",
        message: "Validasi batch berhasil dijalankan.",
      })
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) })
    }
  }

  async function handleCommit() {
    if (!selectedBatch) return

    try {
      setNotice(null)
      await commitMutation.mutateAsync(selectedBatch.id)
      await batchesQuery.refetch()

      setNotice({
        type: "success",
        message: "Commit batch berhasil dijalankan.",
      })
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) })
    }
  }

  async function handleCancel() {
    if (!selectedBatch) return

    try {
      setLocalAction("cancelling")
      setNotice(null)

      const response = await cancelImportBatch(selectedBatch.id)
      await batchesQuery.refetch()

      setNotice({
        type: "success",
        message: response.message || "Batch berhasil dibatalkan.",
      })
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) })
    } finally {
      setLocalAction("idle")
    }
  }

  async function handleCreateJabatanReferences() {
    if (!selectedBatch) return

    try {
      setNotice(null)
      await createJabatanMutation.mutateAsync(selectedBatch.id)
      await missingReferencesQuery.refetch()
      await batchesQuery.refetch()

      setNotice({
        type: "success",
        message: "Referensi jabatan berhasil diproses.",
      })
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) })
    }
  }

  async function handleCreateUnorReferences() {
    if (!selectedBatch) return

    try {
      setNotice(null)
      await createUnorMutation.mutateAsync(selectedBatch.id)
      await missingReferencesQuery.refetch()
      await batchesQuery.refetch()

      setNotice({
        type: "success",
        message: "Referensi UNOR berhasil diproses.",
      })
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) })
    }
  }

  async function handleCreatePendidikanReferences() {
    if (!selectedBatch) return

    try {
      setNotice(null)
      await createPendidikanMutation.mutateAsync(selectedBatch.id)
      await missingReferencesQuery.refetch()
      await batchesQuery.refetch()

      setNotice({
        type: "success",
        message: "Referensi pendidikan berhasil diproses.",
      })
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) })
    }
  }

  return {
    page,
    setPage,
    q,
    setQ,
    status,
    setStatus,
    selectedFile,
    selectedBatch,
    selectedBatchId,
    setSelectedBatchId,
    notice,
    localAction,
    batches,
    meta,
    summary,
    batchesQuery,
    errorsQuery,
    missingReferencesQuery,
    isActionLoading,
    validateLoading: validateMutation.isPending,
    commitLoading: commitMutation.isPending,
    createJabatanLoading: createJabatanMutation.isPending,
    createUnorLoading: createUnorMutation.isPending,
    createPendidikanLoading: createPendidikanMutation.isPending,
    handleFileChange,
    handleUpload,
    handleValidate,
    handleCommit,
    handleCancel,
    handleCreateJabatanReferences,
    handleCreateUnorReferences,
    handleCreatePendidikanReferences,
    selectedErrorRow,
    updateRowLoading,
    updateRowError,
    handleEditRow,
    handleCloseEditRowModal,
    handleUpdateRow,    
  }
}