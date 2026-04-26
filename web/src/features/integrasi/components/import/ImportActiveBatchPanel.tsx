import type { ImportBatchItem } from "../../types"
import { ImportStatCard } from "./ImportStatCard"
import { ImportStatusBadge } from "./ImportStatusBadge"
import { formatDate } from "./import-ui"

type ImportActiveBatchPanelProps = {
  batch: ImportBatchItem | null
  onValidate: () => void
  onCommit: () => void
  onCancel: () => void
  validateLoading: boolean
  commitLoading: boolean
  cancelLoading: boolean
  canValidate: boolean
  canCommit: boolean
  canCancel: boolean
  disabled: boolean
}

export function ImportActiveBatchPanel({
  batch,
  onValidate,
  onCommit,
  onCancel,
  validateLoading,
  commitLoading,
  cancelLoading,
  canValidate,
  canCommit,
  canCancel,
  disabled,
}: ImportActiveBatchPanelProps) {
  if (!batch) {
    return (
      <div className="card shadow-sm h-100">
        <div className="card-body d-flex align-items-center justify-content-center py-10">
          <div className="text-center">
            <div className="fw-bold text-gray-900 fs-5 mb-1">
              Belum ada batch aktif
            </div>
            <div className="text-gray-600 fs-7">
              Upload file atau pilih batch dari riwayat import.
            </div>
          </div>
        </div>
      </div>
    )
  }

  const progress =
    batch.totalRows === 0
      ? 0
      : Math.round((batch.validRows / batch.totalRows) * 100)

  return (
    <div className="card shadow-sm h-100">
      <div className="card-header border-0 pt-6">
        <div className="card-title flex-column align-items-start">
          <h3 className="fw-bold text-gray-900 mb-1">Active Batch</h3>
          <div className="text-gray-600 fs-7">
            Batch terpilih untuk validasi dan commit.
          </div>
        </div>

        <div className="card-toolbar">
          <ImportStatusBadge status={batch.status} />
        </div>
      </div>

      <div className="card-body pt-2">
        <div className="rounded border border-gray-300 border-dashed px-5 py-4 mb-5">
          <div className="fw-bold text-gray-900 fs-5">{batch.batchCode}</div>
          <div className="text-gray-600 fs-7 mt-1">{batch.fileName}</div>
          <div className="text-gray-500 fs-8 mt-2">
            Update terakhir: {formatDate(batch.updatedAt)}
          </div>
        </div>

        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-gray-600 fs-7 fw-semibold">
              Valid Progress
            </span>
            <span className="text-gray-900 fs-7 fw-bold">{progress}%</span>
          </div>

          <div className="progress h-8px bg-light">
            <div
              className="progress-bar bg-primary"
              role="progressbar"
              style={{ width: `${progress}%` }}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-6">
            <ImportStatCard label="Rows" value={batch.totalRows} />
          </div>
          <div className="col-6">
            <ImportStatCard label="Valid" value={batch.validRows} tone="success" />
          </div>
          <div className="col-6">
            <ImportStatCard label="Invalid" value={batch.invalidRows} tone="danger" />
          </div>
          <div className="col-6">
            <ImportStatCard label="Imported" value={batch.importedRows} tone="info" />
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled || !canValidate}
            onClick={onValidate}
            className="btn btn-sm btn-primary"
          >
            {validateLoading ? "Validating..." : "Validate"}
          </button>

          <button
            type="button"
            disabled={disabled || !canCommit}
            onClick={onCommit}
            className="btn btn-sm btn-success"
          >
            {commitLoading ? "Committing..." : "Commit"}
          </button>

          <button
            type="button"
            disabled={disabled || !canCancel}
            onClick={onCancel}
            className="btn btn-sm btn-light-danger"
          >
            {cancelLoading ? "Cancel..." : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  )
}