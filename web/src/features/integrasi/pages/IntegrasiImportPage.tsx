import { useCallback, useMemo, useState, type ChangeEvent } from "react"
import { uploadImportPegawaiFile } from "../api/integrasi.api"
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

export default function IntegrasiImportPage() {
  // ─── List state ─────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1)
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // ─── Wizard state (query-param style, but in local state) ─────────────────
  // wizardBatchId = null → list view; string → wizard view
  const [wizardBatchId, setWizardBatchId] = useState<string | null>(null)

  const query: ImportBatchQuery = useMemo(
    () => ({ page, limit: 10, q: q.trim() || undefined, status: status || undefined }),
    [page, q, status],
  )

  const batchesQuery = useIntegrasiImportBatches(query)
  const batches = batchesQuery.data?.data ?? []
  const meta = batchesQuery.data?.meta

  const summary = useMemo(
    () =>
      batches.reduce(
        (acc, b) => ({
          totalRows: acc.totalRows + b.totalRows,
          validRows: acc.validRows + b.validRows,
          invalidRows: acc.invalidRows + b.invalidRows,
          importedRows: acc.importedRows + b.importedRows,
        }),
        { totalRows: 0, validRows: 0, invalidRows: 0, importedRows: 0 },
      ),
    [batches],
  )

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setNotice(null)
    if (!file) { setSelectedFile(null); return }
    if (!isValidFile(file)) {
      event.target.value = ""
      setSelectedFile(null)
      setNotice({ type: "error", message: "Format file tidak valid. Gunakan .xlsx, .xls, atau .csv." })
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
      setWizardBatchId(response.batchId)
      setNotice({ type: "success", message: response.message || "File berhasil diupload." })
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) })
    } finally {
      setUploading(false)
    }
  }

  const handleOpenWizard = useCallback((batchId: string) => {
    setNotice(null)
    setWizardBatchId(batchId)
  }, [])

  const handleBack = useCallback(() => {
    setWizardBatchId(null)
    void batchesQuery.refetch()
  }, [batchesQuery])

  const handleNewUpload = useCallback(() => {
    setWizardBatchId(null)
    void batchesQuery.refetch()
  }, [batchesQuery])

  // ─── Wizard view ─────────────────────────────────────────────────────────────
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

  // ─── List view ───────────────────────────────────────────────────────────────
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
        <ImportStatCard label="Total Rows" value={summary.totalRows} helper="Akumulasi semua batch" />
        <ImportStatCard label="Valid" value={summary.validRows} helper="Lolos validasi" tone="success" />
        <ImportStatCard label="Invalid" value={summary.invalidRows} helper="Perlu perbaikan" tone="danger" />
        <ImportStatCard label="Imported" value={summary.importedRows} helper="Sudah masuk master" tone="info" />
      </div>

      <ImportBatchTable
        batches={batches}
        loading={batchesQuery.isLoading}
        meta={meta}
        page={page}
        q={q}
        status={status}
        selectedBatchId={null}
        onPageChange={setPage}
        onSearchChange={(v) => { setQ(v); setPage(1) }}
        onStatusChange={(v) => { setStatus(v); setPage(1) }}
        onSelectBatch={handleOpenWizard}
      />
    </div>
  )
}
