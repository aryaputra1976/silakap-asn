import type { CommitReadiness, ImportBatchItem } from "../types"
import { BatchSummaryCards } from "../components/import/BatchSummaryCards"
import { CommitReadinessPanel } from "../components/import/CommitReadinessPanel"

type BatchImportReviewStepProps = {
  batch: ImportBatchItem
  readiness: CommitReadiness
  readinessLoading: boolean
  onCommit: () => void
  commitLoading: boolean
  onCancel: () => void
  cancelLoading: boolean
  disabled: boolean
  onGoToValidation: () => void
  onGoToReference: () => void
}

export function BatchImportReviewStep({
  batch,
  readiness,
  readinessLoading,
  onCommit,
  commitLoading,
  onCancel,
  cancelLoading,
  disabled,
  onGoToValidation,
  onGoToReference,
}: BatchImportReviewStepProps) {
  const canCommit =
    readiness.isReady && batch.status.toUpperCase() === "VALIDATED" && !disabled

  return (
    <div className="d-flex flex-column gap-6">
      <BatchSummaryCards batch={batch} />

      <CommitReadinessPanel
        readiness={readiness}
        loading={readinessLoading}
        onGoToValidation={onGoToValidation}
        onGoToReference={onGoToReference}
      />

      <div className="card shadow-sm">
        <div className="card-body py-6 px-6">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-4">
            <div>
              <div className="fw-bold text-gray-900 fs-6 mb-1">Commit Data ke Master Pegawai</div>
              <div className="text-gray-600 fs-7">
                {canCommit
                  ? "Semua pemeriksaan lolos. Data siap dipindahkan ke master pegawai."
                  : "Selesaikan semua masalah di atas sebelum commit dapat dijalankan."}
              </div>
            </div>
            <div className="d-flex gap-3">
              <button
                type="button"
                disabled={disabled || cancelLoading}
                onClick={onCancel}
                className="btn btn-sm btn-light-danger"
              >
                {cancelLoading ? "Membatalkan..." : "Batalkan Batch"}
              </button>
              <button
                type="button"
                disabled={!canCommit}
                onClick={onCommit}
                className="btn btn-sm btn-success"
                title={!canCommit && !readinessLoading ? "Selesaikan semua masalah terlebih dahulu" : undefined}
              >
                {commitLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Commit Berjalan...
                  </>
                ) : (
                  "Commit ke Master →"
                )}
              </button>
            </div>
          </div>

          {!canCommit && !readinessLoading && readiness.blockingReasons.length > 0 ? (
            <div className="mt-4 text-gray-500 fs-8">
              Tombol commit dinonaktifkan karena:{" "}
              {readiness.blockingReasons.map((r) => r.label).join(", ")}.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
