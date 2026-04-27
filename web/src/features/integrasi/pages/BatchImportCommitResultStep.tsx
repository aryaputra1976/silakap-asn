import { useIntegrasiImportBatchDetail } from "../hooks/useIntegrasiImport"
import type { ImportBatchItem } from "../types"
import { formatDate, formatNumber } from "../components/import/import-ui"
import { ImportStatusBadge } from "../components/import/ImportStatusBadge"

type BatchImportCommitResultStepProps = {
  batchId: string
  batch: ImportBatchItem
  onNewUpload: () => void
}

export function BatchImportCommitResultStep({
  batchId,
  batch: initialBatch,
  onNewUpload,
}: BatchImportCommitResultStepProps) {
  const { data } = useIntegrasiImportBatchDetail(batchId)
  const batch = data ?? initialBatch
  const status = batch.status.toUpperCase()
  const isCommitting = status === "COMMITTING"
  const isImported = status === "IMPORTED"
  const isFailed = status === "FAILED"

  return (
    <div className="d-flex flex-column gap-6">
      <div className="card shadow-sm">
        <div className="card-body py-10 px-8">
          {isCommitting ? (
            <div className="text-center">
              <div className="spinner-border text-primary mb-4" style={{ width: "3rem", height: "3rem" }} />
              <div className="fw-bold text-gray-900 fs-4 mb-2">Commit sedang berjalan...</div>
              <div className="text-gray-600 fs-7">
                Data sedang dipindahkan ke master pegawai. Halaman akan diperbarui otomatis.
              </div>
            </div>
          ) : isImported ? (
            <div className="text-center">
              <div className="symbol symbol-80px mb-6">
                <div className="symbol-label bg-light-success">
                  <span className="fs-1 text-success">✓</span>
                </div>
              </div>
              <div className="fw-bolder text-gray-900 fs-2 mb-2">Commit Berhasil</div>
              <div className="text-gray-600 fs-6 mb-6">
                <span className="fw-bold text-success fs-3">{formatNumber(batch.importedRows)}</span>
                {" "}dari {formatNumber(batch.totalRows)} baris berhasil diimport ke master pegawai.
              </div>
              <div className="text-gray-500 fs-7 mb-6">
                Batch <span className="fw-bold text-gray-800">{batch.batchCode}</span> · {formatDate(batch.updatedAt)}
              </div>
              <button
                type="button"
                onClick={onNewUpload}
                className="btn btn-primary"
              >
                Upload Batch Baru
              </button>
            </div>
          ) : isFailed ? (
            <div className="text-center">
              <div className="symbol symbol-80px mb-6">
                <div className="symbol-label bg-light-danger">
                  <span className="fs-1 text-danger">✗</span>
                </div>
              </div>
              <div className="fw-bolder text-gray-900 fs-2 mb-2">Commit Gagal</div>
              <div className="text-gray-600 fs-6 mb-6">
                Terjadi kesalahan saat memproses batch ini. Periksa log untuk detail error.
              </div>
              <div className="text-gray-500 fs-7">
                Batch <span className="fw-bold text-gray-800">{batch.batchCode}</span>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="fw-bold text-gray-900 fs-5 mb-2">Status Batch</div>
              <ImportStatusBadge status={batch.status} />
            </div>
          )}
        </div>
      </div>

      {isImported ? (
        <div className="card shadow-sm">
          <div className="card-header border-0 pt-5">
            <div className="card-title">
              <h3 className="fw-bold text-gray-900">Ringkasan Hasil</h3>
            </div>
          </div>
          <div className="card-body pt-2">
            <div className="row g-4">
              <div className="col-6 col-md-3">
                <div className="rounded border border-dashed border-gray-300 px-5 py-4 text-center">
                  <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-1">Total Baris</div>
                  <div className="fw-bolder fs-2x text-gray-900">{formatNumber(batch.totalRows)}</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="rounded border border-dashed border-success px-5 py-4 text-center">
                  <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-1">Diimport</div>
                  <div className="fw-bolder fs-2x text-success">{formatNumber(batch.importedRows)}</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="rounded border border-dashed border-gray-300 px-5 py-4 text-center">
                  <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-1">Valid</div>
                  <div className="fw-bolder fs-2x text-primary">{formatNumber(batch.validRows)}</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="rounded border border-dashed border-gray-300 px-5 py-4 text-center">
                  <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-1">Invalid</div>
                  <div className="fw-bolder fs-2x text-danger">{formatNumber(batch.invalidRows)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
