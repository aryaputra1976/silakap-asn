import type { ImportBatchItem, ImportErrorRow, MissingReferencesResponse } from "../types"
import { BatchSummaryCards } from "../components/import/BatchSummaryCards"
import { ProblemRowsTable } from "../components/import/ProblemRowsTable"
import { ImportEditRowModal } from "../components/import/ImportEditRowModal"
import type { ImportEditRowPayload } from "../components/import/ImportEditRowModal"
import { formatNumber } from "../components/import/import-ui"

type BatchImportValidationStepProps = {
  batch: ImportBatchItem
  rows: ImportErrorRow[]
  rowsLoading: boolean
  rowsPage: number
  rowsTotalPages: number
  rowsTotal: number
  onRowsPageChange: (page: number) => void
  onValidate: () => void
  validateLoading: boolean
  canValidate: boolean
  disabled: boolean
  onEditRow: (row: ImportErrorRow) => void
  selectedErrorRow: ImportErrorRow | null
  updateRowLoading: boolean
  updateRowError: string | null
  onCloseEditRow: () => void
  onUpdateRow: (rowId: string, payload: ImportEditRowPayload) => Promise<void>
  missingReferences?: MissingReferencesResponse
  onNext: () => void
}

export function BatchImportValidationStep({
  batch,
  rows,
  rowsLoading,
  rowsPage,
  rowsTotalPages,
  rowsTotal,
  onRowsPageChange,
  onValidate,
  validateLoading,
  canValidate,
  disabled,
  onEditRow,
  selectedErrorRow,
  updateRowLoading,
  updateRowError,
  onCloseEditRow,
  onUpdateRow,
  missingReferences,
  onNext,
}: BatchImportValidationStepProps) {
  const status = batch.status.toUpperCase()
  const isValidating = status === "VALIDATING"
  const hasErrors = batch.invalidRows > 0
  const hasMissing =
    (missingReferences?.jabatan.length ?? 0) +
      (missingReferences?.unor.length ?? 0) +
      (missingReferences?.pendidikan.length ?? 0) >
    0
  const canProceed = !hasErrors

  return (
    <div className="d-flex flex-column gap-6">
      <BatchSummaryCards batch={batch} />

      {isValidating ? (
        <div className="card shadow-sm">
          <div className="card-body py-10 text-center">
            <div className="spinner-border text-primary mb-4" />
            <div className="fw-bold text-gray-900 fs-5 mb-1">Validasi sedang berjalan</div>
            <div className="text-gray-600 fs-7">Halaman akan diperbarui otomatis saat selesai.</div>
          </div>
        </div>
      ) : null}

      {!isValidating && (
        <div className="card shadow-sm">
          <div className="card-body py-5 px-6">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-4">
              <div>
                <div className="fw-bold text-gray-900 fs-6 mb-1">Hasil Validasi</div>
                <div className="text-gray-600 fs-7">
                  {hasErrors
                    ? `${formatNumber(batch.invalidRows)} baris gagal validasi — perbaiki data, lalu validasi ulang.`
                    : hasMissing
                      ? "Semua baris valid. Ada referensi hilang yang perlu diselesaikan."
                      : "Semua baris valid dan referensi lengkap."}
                </div>
              </div>
              <div className="d-flex gap-2">
                {canValidate ? (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={onValidate}
                    className="btn btn-sm btn-light-primary"
                  >
                    {validateLoading ? "Memvalidasi..." : "Validasi Ulang"}
                  </button>
                ) : null}
                {canProceed ? (
                  <button
                    type="button"
                    onClick={onNext}
                    className="btn btn-sm btn-primary"
                  >
                    Lanjut ke Referensi →
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {!isValidating && hasErrors ? (
        <ProblemRowsTable
          rows={rows}
          loading={rowsLoading}
          total={rowsTotal}
          page={rowsPage}
          totalPages={rowsTotalPages}
          onPageChange={onRowsPageChange}
          onEditRow={onEditRow}
        />
      ) : null}

      <ImportEditRowModal
        row={selectedErrorRow}
        loading={updateRowLoading}
        error={updateRowError}
        onClose={onCloseEditRow}
        onSubmit={onUpdateRow}
      />
    </div>
  )
}
