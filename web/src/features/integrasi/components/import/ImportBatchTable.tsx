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
  const total = meta?.total ?? 0

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Riwayat Batch Import
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Pilih batch untuk melihat error, referensi hilang, dan proses lanjutan.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={q}
            onChange={(event) => {
              onSearchChange(event.target.value)
              onPageChange(1)
            }}
            placeholder="Cari batch / file..."
            className="h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-blue-500"
          />

          <select
            value={status}
            onChange={(event) => {
              onStatusChange(event.target.value)
              onPageChange(1)
            }}
            className="h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-blue-500"
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

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Batch</th>
              <th className="px-4 py-3">File</th>
              <th className="px-4 py-3 text-right">Rows</th>
              <th className="px-4 py-3 text-right">Valid</th>
              <th className="px-4 py-3 text-right">Invalid</th>
              <th className="px-4 py-3 text-right">Imported</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Update</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                  Memuat data batch...
                </td>
              </tr>
            ) : batches.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
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
                        ? "border-l-4 border-blue-600 bg-blue-50/70"
                        : "border-l-4 border-transparent bg-white hover:bg-slate-50"
                    }
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {batch.batchCode}
                    </td>
                    <td className="max-w-[260px] truncate px-4 py-3 text-slate-600">
                      {batch.fileName}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {formatNumber(batch.totalRows)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-700">
                      {formatNumber(batch.validRows)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-rose-700">
                      {formatNumber(batch.invalidRows)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-blue-700">
                      {formatNumber(batch.importedRows)}
                    </td>
                    <td className="px-4 py-3">
                      <ImportStatusBadge status={batch.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {formatDate(batch.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectBatch(batch.id)}
                        className={
                          isSelected
                            ? "rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
                            : "rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                        }
                      >
                        {isSelected ? "Aktif" : "Pilih"}
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 p-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div>
          Total: <strong>{formatNumber(total)}</strong>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>

          <span>
            Page {meta?.page ?? page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}