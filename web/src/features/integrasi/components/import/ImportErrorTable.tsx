import { formatNumber } from "./import-ui"
import type { ImportBatchItem, ImportErrorRow } from "../../types"

export function ImportErrorTable({
  batch,
  rows,
  loading,
}: {
  batch: ImportBatchItem
  rows: ImportErrorRow[]
  loading: boolean
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Error Import
        </h2>
        <p className="text-sm text-slate-500">
          Batch: {batch.batchCode}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Row</th>
              <th className="px-3 py-2">NIP</th>
              <th className="px-3 py-2">Nama</th>
              <th className="px-3 py-2">SIASN ID</th>
              <th className="px-3 py-2">Error</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                  Memuat error...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                  Tidak ada error.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-3 py-2">
                    {formatNumber(row.rowNumber)}
                  </td>
                  <td className="px-3 py-2">{row.nip ?? "-"}</td>
                  <td className="px-3 py-2">{row.nama ?? "-"}</td>
                  <td className="px-3 py-2">{row.siasnId ?? "-"}</td>
                  <td className="px-3 py-2">
                    <pre className="max-h-24 overflow-auto rounded-xl bg-rose-50 p-2 text-xs text-rose-700">
                      {JSON.stringify(row.errors, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}