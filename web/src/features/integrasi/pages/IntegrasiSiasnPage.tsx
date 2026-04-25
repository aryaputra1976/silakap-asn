import { useQuery } from "@tanstack/react-query"
import {
  getIntegrasiSiasnStatus,
  getIntegrasiSiasnSummary,
} from "../api/integrasi.api"

const healthClass: Record<string, string> = {
  HEALTHY: "bg-emerald-100 text-emerald-700",
  PARTIAL: "bg-blue-100 text-blue-700",
  WARNING: "bg-amber-100 text-amber-700",
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function HealthBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        healthClass[status] ?? "bg-slate-100 text-slate-700"
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
  value: number | string
  hint: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  )
}

export default function IntegrasiSiasnPage() {
  const summary = useQuery({
    queryKey: ["integrasi", "siasn-summary"],
    queryFn: getIntegrasiSiasnSummary,
  })

  const status = useQuery({
    queryKey: ["integrasi", "siasn-status"],
    queryFn: getIntegrasiSiasnStatus,
  })

  const coverage = summary.data?.pegawai.siasnCoveragePercent ?? 0

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Integrasi Eksternal
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Sinkronisasi SIASN
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Monitoring cakupan SIASN ID, status sinkronisasi, dan kondisi
              batch import pegawai.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs font-semibold uppercase text-slate-500">
              Health Status
            </div>
            <div className="mt-2 flex items-center gap-2">
              <HealthBadge status={status.data?.status ?? "UNKNOWN"} />
              <span className="text-xs text-slate-500">
                {formatDate(status.data?.checkedAt)}
              </span>
            </div>
          </div>
        </div>

        {status.data?.message ? (
          <div className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {status.data.message}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Pegawai"
          value={formatNumber(summary.data?.pegawai.total ?? 0)}
          hint="Pegawai aktif dan nonaktif"
        />
        <SummaryCard
          label="Punya SIASN ID"
          value={formatNumber(summary.data?.pegawai.withSiasnId ?? 0)}
          hint="Data sudah terhubung SIASN"
        />
        <SummaryCard
          label="Belum SIASN ID"
          value={formatNumber(summary.data?.pegawai.withoutSiasnId ?? 0)}
          hint="Butuh sinkronisasi lanjutan"
        />
        <SummaryCard
          label="Coverage"
          value={`${coverage}%`}
          hint="Persentase kepemilikan SIASN ID"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Cakupan SIASN</h2>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">
                Pegawai dengan SIASN ID
              </span>
              <span className="font-semibold text-slate-900">
                {coverage}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${Math.min(100, coverage)}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xl font-bold text-emerald-600">
                {formatNumber(summary.data?.pegawai.active ?? 0)}
              </div>
              <div className="text-xs text-slate-500">Pegawai Aktif</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xl font-bold text-slate-600">
                {formatNumber(summary.data?.pegawai.inactive ?? 0)}
              </div>
              <div className="text-xs text-slate-500">Pegawai Nonaktif</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Sinkronisasi Terakhir</h2>

          {summary.data?.sync.latestSyncedPegawai ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">
                  {summary.data.sync.latestSyncedPegawai.nama}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  NIP: {summary.data.sync.latestSyncedPegawai.nip}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  SIASN ID:{" "}
                  {summary.data.sync.latestSyncedPegawai.siasnId ?? "-"}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase text-slate-500">
                    Last Synced
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    {formatDate(
                      summary.data.sync.latestSyncedPegawai.lastSyncedAt,
                    )}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase text-slate-500">
                    Source
                  </div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    {summary.data.sync.latestSyncedPegawai.syncSource ?? "-"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500">
              Belum ada data sinkronisasi pegawai.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Batch Import Terakhir</h2>

        {summary.data?.sync.latestImportBatch ? (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Valid</th>
                  <th className="px-4 py-3">Invalid</th>
                  <th className="px-4 py-3">Imported</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="px-4 py-4 font-semibold text-slate-900">
                    {summary.data.sync.latestImportBatch.fileName}
                    <div className="text-xs font-normal text-slate-500">
                      {summary.data.sync.latestImportBatch.batchCode}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {summary.data.sync.latestImportBatch.status}
                  </td>
                  <td className="px-4 py-4">
                    {formatNumber(summary.data.sync.latestImportBatch.totalRows)}
                  </td>
                  <td className="px-4 py-4 text-emerald-600">
                    {formatNumber(summary.data.sync.latestImportBatch.validRows)}
                  </td>
                  <td className="px-4 py-4 text-amber-600">
                    {formatNumber(summary.data.sync.latestImportBatch.invalidRows)}
                  </td>
                  <td className="px-4 py-4 text-blue-600">
                    {formatNumber(
                      summary.data.sync.latestImportBatch.importedRows,
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-500">
                    {formatDate(summary.data.sync.latestImportBatch.updatedAt)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-500">
            Belum ada batch import.
          </p>
        )}
      </div>

      {summary.isLoading || status.isLoading ? (
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          Memuat data integrasi SIASN...
        </div>
      ) : null}
    </div>
  )
}