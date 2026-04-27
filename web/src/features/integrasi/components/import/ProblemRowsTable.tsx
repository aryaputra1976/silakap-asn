import type { ImportErrorRow } from "../../types"
import { formatNumber } from "./import-ui"

type ProblemRowsTableProps = {
  rows: ImportErrorRow[]
  loading: boolean
  total: number
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onEditRow: (row: ImportErrorRow) => void
}

function formatErrors(errors: unknown): string {
  if (!errors) return "-"
  if (typeof errors === "string") return errors
  try {
    return JSON.stringify(errors, null, 2)
  } catch {
    return "Format error tidak dapat ditampilkan."
  }
}

export function ProblemRowsTable({
  rows,
  loading,
  total,
  page,
  totalPages,
  onPageChange,
  onEditRow,
}: ProblemRowsTableProps) {
  return (
    <div className="card shadow-sm">
      <div className="card-header border-0 pt-5">
        <div className="card-title flex-column align-items-start">
          <h3 className="fw-bold text-gray-900 mb-1">Baris Bermasalah</h3>
          <div className="text-gray-600 fs-7">
            Tampilkan baris yang gagal validasi untuk diperbaiki.
          </div>
        </div>
        <div className="card-toolbar">
          <span className="badge badge-light-danger">
            {formatNumber(total)} baris
          </span>
        </div>
      </div>

      <div className="card-body pt-2">
        <div className="table-responsive">
          <table className="table align-middle table-row-dashed fs-6 gy-4">
            <thead>
              <tr className="text-start text-gray-500 fw-bold fs-7 text-uppercase">
                <th className="w-60px">Baris</th>
                <th>NIP / Nama</th>
                <th>NIK</th>
                <th>SIASN ID</th>
                <th>Error</th>
                <th className="text-end w-100px">Aksi</th>
              </tr>
            </thead>

            <tbody className="fw-semibold text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500 fs-7">
                    Memuat data...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500 fs-7">
                    Tidak ada baris bermasalah.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span className="badge badge-light-dark">
                        {row.rowNumber}
                      </span>
                    </td>
                    <td>
                      <div className="fw-bold text-gray-900 fs-7">{row.nama ?? "-"}</div>
                      <div className="text-gray-500 fs-8">{row.nip ?? "-"}</div>
                    </td>
                    <td className="text-gray-600 fs-8">{row.nik ?? "-"}</td>
                    <td className="text-gray-500 fs-8">{row.siasnId ?? "-"}</td>
                    <td className="mw-250px">
                      <pre className="mb-0 max-h-100px overflow-auto rounded bg-light-danger px-3 py-2 fs-9 text-danger lh-sm">
                        {formatErrors(row.errors)}
                      </pre>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-xs btn-light-primary"
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

        {totalPages > 1 ? (
          <div className="d-flex align-items-center justify-content-between pt-4">
            <div className="text-gray-600 fs-8">
              Halaman {page} / {totalPages}
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="btn btn-xs btn-light"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="btn btn-xs btn-light"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
