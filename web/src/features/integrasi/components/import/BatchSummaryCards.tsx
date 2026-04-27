import type { ImportBatchItem } from "../../types"
import { formatNumber } from "./import-ui"

type CardProps = {
  label: string
  value: number
  tone?: "default" | "success" | "danger" | "info" | "warning"
  helper?: string
}

function SummaryCard({ label, value, tone = "default", helper }: CardProps) {
  const valueClass = {
    default: "text-gray-900",
    success: "text-success",
    danger: "text-danger",
    info: "text-primary",
    warning: "text-warning",
  }[tone]

  return (
    <div className="rounded border border-gray-300 border-dashed px-5 py-4">
      <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-1">{label}</div>
      <div className={`fw-bolder fs-2x ${valueClass}`}>{formatNumber(value)}</div>
      {helper ? <div className="text-gray-500 fs-8 mt-1">{helper}</div> : null}
    </div>
  )
}

type BatchSummaryCardsProps = {
  batch: ImportBatchItem
}

export function BatchSummaryCards({ batch }: BatchSummaryCardsProps) {
  const progress =
    batch.totalRows === 0
      ? 0
      : Math.round((batch.validRows / batch.totalRows) * 100)

  return (
    <div className="card shadow-sm mb-6">
      <div className="card-body py-5 px-6">
        <div className="row g-4 mb-4">
          <div className="col-6 col-md-3">
            <SummaryCard label="Total Baris" value={batch.totalRows} helper="Baris di file Excel" />
          </div>
          <div className="col-6 col-md-3">
            <SummaryCard label="Valid" value={batch.validRows} tone="success" helper="Lolos validasi" />
          </div>
          <div className="col-6 col-md-3">
            <SummaryCard label="Invalid" value={batch.invalidRows} tone="danger" helper="Perlu perbaikan" />
          </div>
          <div className="col-6 col-md-3">
            <SummaryCard label="Diimport" value={batch.importedRows} tone="info" helper="Sudah masuk master" />
          </div>
        </div>

        <div>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="text-gray-600 fs-8 fw-semibold">Progress Valid</span>
            <span className="text-gray-900 fs-8 fw-bold">{progress}%</span>
          </div>
          <div className="progress h-6px bg-light">
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: `${progress}%` }}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
