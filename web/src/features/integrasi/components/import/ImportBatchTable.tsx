import type { ImportBatchItem, PaginatedResponse } from "../../types"
import { formatDate, formatNumber } from "./import-ui"
import { ImportStatusBadge } from "./ImportStatusBadge"

type ImportBatchTableProps = {
  batches: ImportBatchItem[]
  loading: boolean
  meta?: PaginatedResponse<ImportBatchItem>["meta"]
  page: number
  q: string
  status: string
  selectedBatchId: string | null
  onPageChange: (page: number) => void
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onSelectBatch: (batchId: string) => void
}

export function ImportBatchTable({
  batches,
  loading,
  meta,
  page,
  q,
  status,
  selectedBatchId,
  onPageChange,
  onSearchChange,
  onStatusChange,
  onSelectBatch,
}: ImportBatchTableProps) {
  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="card shadow-sm">
      <div className="card-header border-0 pt-6">
        <div className="card-title flex-column align-items-start">
          <h3 className="fw-bold text-gray-900 mb-1">Riwayat Batch Import</h3>
          <div className="text-gray-600 fs-7">
            Pilih batch untuk melihat error, referensi hilang, dan proses lanjutan.
          </div>
        </div>

        <div className="card-toolbar">
          <div className="d-flex flex-column flex-md-row gap-3">
            <input
              value={q}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Cari batch / file..."
              className="form-control form-control-sm w-200px"
            />

            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              className="form-select form-select-sm w-200px"
            >
              <option value="">Semua Status</option>
              <option value="DRAFT">Draft</option>
              <option value="VALIDATING">Validating</option>
              <option value="VALIDATED">Tervalidasi</option>
              <option value="VALIDATED_WITH_ERROR">Validasi Error</option>
              <option value="COMMITTING">Committing</option>
              <option value="IMPORTED">Sudah Diimport</option>
              <option value="FAILED">Gagal</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card-body pt-2">
        <div className="table-responsive">
          <table className="table align-middle table-row-dashed fs-6 gy-4">
            <thead>
              <tr className="text-start text-gray-500 fw-bold fs-7 text-uppercase">
                <th>Batch</th>
                <th>File</th>
                <th className="text-end">Rows</th>
                <th className="text-end">Valid</th>
                <th className="text-end">Invalid</th>
                <th className="text-end">Imported</th>
                <th>Status</th>
                <th>Update</th>
                <th className="text-end">Aksi</th>
              </tr>
            </thead>

            <tbody className="fw-semibold text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-gray-500">
                    Memuat data batch...
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-gray-500">
                    Belum ada batch import.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => {
                  const isSelected = selectedBatchId === batch.id

                  return (
                    <tr
                      key={batch.id}
                      className={
                        isSelected
                          ? "cursor-pointer bg-light-primary"
                          : "cursor-pointer"
                      }
                      onClick={() => onSelectBatch(batch.id)}
                    >
                      <td>
                        <div className="fw-bold text-gray-900">
                          {batch.batchCode}
                        </div>
                      </td>
                      <td>
                        <div
                          className="text-gray-700 text-break"
                          style={{ maxWidth: 200 }}
                        >
                          {batch.fileName}
                        </div>
                      </td>
                      <td className="text-end">{formatNumber(batch.totalRows)}</td>
                      <td className="text-end text-success">
                        {formatNumber(batch.validRows)}
                      </td>
                      <td className="text-end text-danger">
                        {formatNumber(batch.invalidRows)}
                      </td>
                      <td className="text-end text-primary">
                        {formatNumber(batch.importedRows)}
                      </td>
                      <td>
                        <ImportStatusBadge status={batch.status} />
                      </td>
                      <td className="text-gray-500 fs-7">
                        {formatDate(batch.updatedAt)}
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            onSelectBatch(batch.id)
                          }}
                          className={
                            isSelected
                              ? "btn btn-sm btn-primary"
                              : "btn btn-sm btn-light-primary"
                          }
                        >
                          {isSelected ? "Aktif" : "Buka Detail"}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 pt-4">
          <div className="text-gray-600 fs-7">
            Total:{" "}
            <span className="fw-bold text-gray-900">
              {formatNumber(meta?.total ?? 0)}
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
              className="btn btn-sm btn-light"
            >
              Prev
            </button>

            <div className="text-gray-600 fs-7">
              Page {meta?.page ?? page} / {totalPages}
            </div>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="btn btn-sm btn-light"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
