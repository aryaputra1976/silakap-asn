import { useCallback, useMemo, useState, type ChangeEvent } from "react"
import { useSearchParams } from "react-router-dom"
import {
  exportImportBatchesCsv,
  uploadImportPegawaiFile,
} from "../api/integrasi.api"
import { useDebouncedValue } from "../hooks/useDebouncedValue"
import { useIntegrasiImportBatches } from "../hooks/useIntegrasiImport"
import type { ImportBatchQuery } from "../types"
import { ImportPageHeader } from "../components/import/ImportPageHeader"
import { ImportUploadPanel } from "../components/import/ImportUploadPanel"
import { ImportBatchTable } from "../components/import/ImportBatchTable"
import { ImportStatCard } from "../components/import/ImportStatCard"
import { BatchImportCreatePage } from "./BatchImportCreatePage"

const ACCEPTED = [".xlsx", ".xls", ".csv"]

function isValidFile(file: File) {
  const name = file.name.toLowerCase()
  return ACCEPTED.some((ext) => name.endsWith(ext))
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message)
  }
  return "Terjadi kesalahan. Silakan coba lagi."
}

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export default function IntegrasiImportPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePositiveInt(searchParams.get("page"), 1)
  const q = searchParams.get("q") ?? ""
  const status = searchParams.get("status") ?? ""
  const wizardBatchId = searchParams.get("batchId")
  const debouncedQ = useDebouncedValue(q, 300)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [notice, setNotice] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const updateQuery = useCallback(
    (patch: Record<string, string | number | null | undefined>) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current)

        Object.entries(patch).forEach(([key, value]) => {
          if (
            value === undefined ||
            value === null ||
            String(value).length === 0
          ) {
            next.delete(key)
          } else {
            next.set(key, String(value))
          }
        })

        return next
      })
    },
    [setSearchParams],
  )

  const query: ImportBatchQuery = useMemo(
    () => ({
      page,
      limit: 10,
      q: debouncedQ.trim() || undefined,
      status: status || undefined,
    }),
    [debouncedQ, page, status],
  )

  const exportQuery: ImportBatchQuery = useMemo(
    () => ({
      q: debouncedQ.trim() || undefined,
      status: status || undefined,
    }),
    [debouncedQ, status],
  )

  const batchesQuery = useIntegrasiImportBatches(query)
  const batches = batchesQuery.data?.data ?? []
  const meta = batchesQuery.data?.meta

  const summary = useMemo(
    () =>
      batches.reduce(
        (acc, batch) => ({
          totalRows: acc.totalRows + batch.totalRows,
          validRows: acc.validRows + batch.validRows,
          invalidRows: acc.invalidRows + batch.invalidRows,
          importedRows: acc.importedRows + batch.importedRows,
        }),
        { totalRows: 0, validRows: 0, invalidRows: 0, importedRows: 0 },
      ),
    [batches],
  )

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setNotice(null)

    if (!file) {
      setSelectedFile(null)
      return
    }

    if (!isValidFile(file)) {
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

  async function handleUpload() {
    if (!selectedFile) {
      setNotice({ type: "error", message: "Pilih file terlebih dahulu." })
      return
    }

    try {
      setUploading(true)
      setNotice(null)
      const response = await uploadImportPegawaiFile(selectedFile)
      await batchesQuery.refetch()
      setSelectedFile(null)
      updateQuery({ batchId: response.batchId })
      setNotice({
        type: "success",
        message: response.message || "File berhasil diupload.",
      })
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) })
    } finally {
      setUploading(false)
    }
  }

  async function handleExport() {
    try {
      setExporting(true)
      setNotice(null)
      const blob = await exportImportBatchesCsv(exportQuery)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      link.download = "integrasi-import-batches.csv"
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) })
    } finally {
      setExporting(false)
    }
  }

  const handleOpenWizard = useCallback(
    (batchId: string) => {
      setNotice(null)
      updateQuery({ batchId })
    },
    [updateQuery],
  )

  const handleBack = useCallback(() => {
    updateQuery({ batchId: null })
    void batchesQuery.refetch()
  }, [batchesQuery, updateQuery])

  const handleNewUpload = useCallback(() => {
    updateQuery({ batchId: null })
    void batchesQuery.refetch()
  }, [batchesQuery, updateQuery])

  if (wizardBatchId) {
    return (
      <div className="space-y-6 p-6">
        <ImportPageHeader />
        <BatchImportCreatePage
          batchId={wizardBatchId}
          onBack={handleBack}
          onNewUpload={handleNewUpload}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <ImportPageHeader />

      {notice ? (
        <div
          className={`rounded-2 border px-4 py-3 fs-7 fw-medium ${
            notice.type === "success"
              ? "border-success bg-light-success text-success"
              : "border-danger bg-light-danger text-danger"
          }`}
        >
          {notice.message}
        </div>
      ) : null}

      <ImportUploadPanel
        file={selectedFile}
        loading={uploading}
        disabled={uploading}
        onChange={handleFileChange}
        onUpload={() => void handleUpload()}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <ImportStatCard
          label="Total Rows"
          value={summary.totalRows}
          helper="Akumulasi semua batch"
        />
        <ImportStatCard
          label="Valid"
          value={summary.validRows}
          helper="Lolos validasi"
          tone="success"
        />
        <ImportStatCard
          label="Invalid"
          value={summary.invalidRows}
          helper="Perlu perbaikan"
          tone="danger"
        />
        <ImportStatCard
          label="Imported"
          value={summary.importedRows}
          helper="Sudah masuk master"
          tone="info"
        />
      </div>

      <div className="d-flex justify-content-end">
        <button
          type="button"
          className="btn btn-sm btn-light-primary"
          disabled={exporting}
          onClick={() => void handleExport()}
        >
          {exporting ? "Mengexport..." : "Export CSV"}
        </button>
      </div>

      <ImportBatchTable
        batches={batches}
        loading={batchesQuery.isLoading}
        meta={meta}
        page={page}
        q={q}
        status={status}
        selectedBatchId={wizardBatchId}
        onPageChange={(nextPage) => updateQuery({ page: nextPage })}
        onSearchChange={(value) => updateQuery({ q: value, page: 1 })}
        onStatusChange={(value) => updateQuery({ status: value, page: 1 })}
        onSelectBatch={handleOpenWizard}
      />
    </div>
  )
}
