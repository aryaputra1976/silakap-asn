import type { ImportBatchItem } from "../types"
import { BatchSummaryCards } from "../components/import/BatchSummaryCards"
import { formatDate, formatNumber } from "../components/import/import-ui"

type BatchImportPreviewStepProps = {
  batch: ImportBatchItem
  onValidate: () => void
  validateLoading: boolean
  canValidate: boolean
  disabled: boolean
}

export function BatchImportPreviewStep({
  batch,
  onValidate,
  validateLoading,
  canValidate,
  disabled,
}: BatchImportPreviewStepProps) {
  return (
    <div className="d-flex flex-column gap-6">
      <BatchSummaryCards batch={batch} />

      <div className="card shadow-sm">
        <div className="card-header border-0 pt-5">
          <div className="card-title flex-column align-items-start">
            <h3 className="fw-bold text-gray-900 mb-1">Informasi File</h3>
            <div className="text-gray-600 fs-7">Detail file yang berhasil diupload.</div>
          </div>
        </div>
        <div className="card-body pt-2">
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <div className="rounded border border-dashed border-gray-300 px-5 py-4">
                <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-1">Kode Batch</div>
                <div className="fw-bold text-gray-900 fs-6">{batch.batchCode}</div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="rounded border border-dashed border-gray-300 px-5 py-4">
                <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-1">Nama File</div>
                <div className="fw-bold text-gray-900 fs-6 text-break">{batch.fileName}</div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="rounded border border-dashed border-gray-300 px-5 py-4">
                <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-1">Total Baris</div>
                <div className="fw-bold text-gray-900 fs-6">{formatNumber(batch.totalRows)} baris data</div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="rounded border border-dashed border-gray-300 px-5 py-4">
                <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-1">Waktu Upload</div>
                <div className="fw-bold text-gray-900 fs-6">{formatDate(batch.createdAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body py-6 px-6">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-4">
            <div>
              <div className="fw-bold text-gray-900 fs-6 mb-1">Langkah Berikutnya</div>
              <div className="text-gray-600 fs-7">
                Jalankan validasi untuk memeriksa setiap baris data dan menemukan referensi yang hilang.
              </div>
            </div>
            <button
              type="button"
              disabled={disabled || !canValidate}
              onClick={onValidate}
              className="btn btn-primary"
            >
              {validateLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Memvalidasi...
                </>
              ) : (
                "Jalankan Validasi ->"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
