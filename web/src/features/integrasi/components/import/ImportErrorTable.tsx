import type { ImportBatchItem, ImportErrorRow } from "../../types"
import { formatNumber } from "./import-ui"
import { ImportStatusBadge } from "./ImportStatusBadge"

type ImportErrorTableProps = {
  batch: ImportBatchItem
  rows: ImportErrorRow[]
  loading: boolean
  onEditRow: (row: ImportErrorRow) => void
}

function formatError(errors: unknown): string {
  if (!errors) return "-"
  if (typeof errors === "string") return errors

  try {
    return JSON.stringify(errors, null, 2)
  } catch {
    return "Format error tidak dapat ditampilkan."
  }
}

export function ImportErrorTable({
  batch,
  rows,
  loading,
  onEditRow,
}: ImportErrorTableProps) {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-header border-0 pt-6">
        <div className="card-title flex-column align-items-start">
          <h3 className="fw-bold text-gray-900 mb-1">Error Import</h3>
          <div className="text-gray-600 fs-7">
            Batch: <span className="fw-bold">{batch.batchCode}</span>
          </div>
        </div>

        <div className="card-toolbar">
          <ImportStatusBadge status={batch.status} />
        </div>
      </div>

      <div className="card-body pt-2">
        <div className="rounded border border-gray-300 border-dashed bg-light-warning bg-opacity-10 px-5 py-4 mb-5">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
            <div>
              <div className="fw-bold text-gray-900 fs-6">
                Pemeriksaan Error Row
              </div>
              <div className="text-gray-600 fs-7">
                Tampilkan sample row invalid untuk membantu perbaikan data dan referensi.
              </div>
            </div>

            <span className="badge badge-light-warning">
              {formatNumber(rows.length)} sample row
            </span>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle table-row-dashed fs-6 gy-4">
            <thead>
              <tr className="text-start text-gray-500 fw-bold fs-7 text-uppercase">
                <th className="w-80px">Row</th>
                <th>NIP</th>
                <th>Nama</th>
                <th>SIASN ID</th>
                <th>Error</th>
                <th className="text-end w-120px">Aksi</th>
              </tr>
            </thead>

            <tbody className="fw-semibold text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    Memuat error import...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    Tidak ada error pada batch ini.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span className="badge badge-light-dark">
                        {formatNumber(row.rowNumber)}
                      </span>
                    </td>
                    <td>{row.nip ?? "-"}</td>
                    <td>
                      <div className="fw-bold text-gray-900">
                        {row.nama ?? "-"}
                      </div>
                      <div className="text-gray-500 fs-8">
                        NIK: {row.nik ?? "-"}
                      </div>
                    </td>
                    <td className="text-gray-600 fs-7">
                      {row.siasnId ?? "-"}
                    </td>
                    <td>
                      <pre className="mb-0 max-h-150px overflow-auto rounded bg-light-danger px-4 py-3 fs-8 text-danger">
                        {formatError(row.errors)}
                      </pre>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-light-primary"
                        onClick={() => onEditRow(row)}
                      >
                        Perbaiki
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}