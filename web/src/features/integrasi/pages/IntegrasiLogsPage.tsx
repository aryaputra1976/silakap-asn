import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  getIntegrasiLogDetail,
  getIntegrasiLogs,
  getIntegrasiLogsSummary,
} from "../api/integrasi.api"
import type { IntegrasiLogItem } from "../types"

const statusClass: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  VALIDATED: "bg-emerald-100 text-emerald-700",
  VALIDATED_WITH_ERROR: "bg-amber-100 text-amber-700",
  IMPORTED: "bg-blue-100 text-blue-700",
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        statusClass[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  )
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string
  value: number
  hint: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-2xl font-bold text-slate-900">
        {formatNumber(value)}
      </p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  )
}

export default function IntegrasiLogsPage() {
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("")
  const [selectedLog, setSelectedLog] = useState<IntegrasiLogItem | null>(null)

  const query = useMemo(
    () => ({
      page: 1,
      limit: 20,
      q,
      status,
    }),
    [q, status],
  )

  const summary = useQuery({
    queryKey: ["integrasi", "logs-summary"],
    queryFn: getIntegrasiLogsSummary,
  })

  const logs = useQuery({
    queryKey: ["integrasi", "logs", query],
    queryFn: () => getIntegrasiLogs(query),
  })

  const detail = useQuery({
    queryKey: ["integrasi", "logs-detail", selectedLog?.id],
    queryFn: () => getIntegrasiLogDetail(selectedLog?.id ?? ""),
    enabled: Boolean(selectedLog),
  })

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-blue-600">
          Integrasi Eksternal
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Riwayat Sinkronisasi
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Pantau riwayat import staging, validasi, error, dan commit data
          pegawai.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Batch"
          value={summary.data?.totalBatches ?? 0}
          hint="Seluruh batch import"
        />
        <SummaryCard
          label="Batch Error"
          value={summary.data?.errorBatches ?? 0}
          hint="Butuh perbaikan referensi"
        />
        <SummaryCard
          label="Rows Valid"
          value={summary.data?.validRows ?? 0}
          hint="Data siap commit"
        />
        <SummaryCard
          label="Rows Imported"
          value={summary.data?.importedRows ?? 0}
          hint="Sudah masuk pegawai utama"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="font-semibold text-slate-900">Daftar Riwayat</h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="Cari batch / file..."
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-blue-500"
              />

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="DRAFT">DRAFT</option>
                <option value="VALIDATED">VALIDATED</option>
                <option value="VALIDATED_WITH_ERROR">
                  VALIDATED_WITH_ERROR
                </option>
                <option value="IMPORTED">IMPORTED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Riwayat</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Ringkasan</th>
                  <th className="px-6 py-3">Waktu</th>
                  <th className="px-6 py-3">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {logs.data?.data.map((item) => (
                  <tr
                    key={item.id}
                    className={
                      selectedLog?.id === item.id
                        ? "bg-blue-50/60"
                        : "hover:bg-slate-50"
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.batchCode}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div>Total: {formatNumber(item.totalRows)}</div>
                      <div className="text-xs text-emerald-600">
                        Valid: {formatNumber(item.validRows)}
                      </div>
                      <div className="text-xs text-amber-600">
                        Invalid: {formatNumber(item.invalidRows)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(item.updatedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(item)}
                        className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}

                {!logs.isLoading && logs.data?.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-sm text-slate-500"
                    >
                      Belum ada riwayat sinkronisasi.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {logs.isLoading ? (
            <div className="px-6 py-10 text-sm text-slate-500">
              Memuat riwayat...
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Detail Riwayat</h2>

          {!selectedLog ? (
            <p className="mt-4 text-sm text-slate-500">
              Pilih salah satu riwayat untuk melihat detail.
            </p>
          ) : null}

          {selectedLog && detail.data ? (
            <div className="mt-4 space-y-5">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {detail.data.title}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {detail.data.batchCode}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xl font-bold text-slate-900">
                    {formatNumber(detail.data.totalRows)}
                  </div>
                  <div className="text-xs text-slate-500">Total</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xl font-bold text-emerald-600">
                    {formatNumber(detail.data.importedRows)}
                  </div>
                  <div className="text-xs text-slate-500">Imported</div>
                </div>
              </div>

              {detail.data.errors ? (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Batch Errors
                  </h3>
                  <pre className="mt-2 max-h-40 overflow-auto rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                    {JSON.stringify(detail.data.errors, null, 2)}
                  </pre>
                </div>
              ) : null}

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Sample Rows
                </h3>

                <div className="mt-2 max-h-96 space-y-3 overflow-auto">
                  {detail.data.rows.map((row) => (
                    <div key={row.id} className="rounded-xl bg-slate-50 p-3">
                      <div className="text-sm font-semibold text-slate-900">
                        Row {row.rowNumber} — {row.nama ?? "-"}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        NIP: {row.nip ?? "-"} · Imported:{" "}
                        {row.isImported ? "Ya" : "Tidak"}
                      </div>
                      {row.errors ? (
                        <pre className="mt-2 whitespace-pre-wrap text-xs text-amber-800">
                          {JSON.stringify(row.errors, null, 2)}
                        </pre>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {selectedLog && detail.isLoading ? (
            <p className="mt-4 text-sm text-slate-500">Memuat detail...</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}