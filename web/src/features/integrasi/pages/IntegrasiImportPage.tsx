import { useMemo, useState } from "react"
import {
  useCommitIntegrasiBatch,
  useCreateJabatanReferences,
  useCreatePendidikanReferences,
  useCreateUnorReferences,
  useIntegrasiImportBatches,
  useIntegrasiImportErrors,
  useIntegrasiMissingReferences,
  useValidateIntegrasiBatch,
} from "../hooks/useIntegrasiImport"
import type { ImportBatchItem } from "../types"

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  VALIDATED: "Tervalidasi",
  VALIDATED_WITH_ERROR: "Validasi Error",
  IMPORTED: "Sudah Diimport",
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
  const tone =
    status === "IMPORTED"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "VALIDATED"
        ? "bg-blue-50 text-blue-700 ring-blue-200"
        : status === "VALIDATED_WITH_ERROR"
          ? "bg-rose-50 text-rose-700 ring-rose-200"
          : "bg-slate-50 text-slate-700 ring-slate-200"

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${tone}`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string
  value: number
  helper?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900">
        {formatNumber(value)}
      </div>
      {helper ? <div className="mt-1 text-xs text-slate-500">{helper}</div> : null}
    </div>
  )
}

export default function IntegrasiImportPage() {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("")
  const [selectedBatch, setSelectedBatch] =
    useState<ImportBatchItem | null>(null)

  const query = useMemo(
    () => ({
      page,
      limit: 10,
      q: q.trim() || undefined,
      status: status || undefined,
    }),
    [page, q, status],
  )

  const batchesQuery = useIntegrasiImportBatches(query)
  const errorsQuery = useIntegrasiImportErrors(
    selectedBatch?.id ?? null,
    { page: 1, limit: 25 },
  )
  const missingReferencesQuery = useIntegrasiMissingReferences(
    selectedBatch?.id ?? null,
  )

  const validateMutation = useValidateIntegrasiBatch()
  const commitMutation = useCommitIntegrasiBatch()
  const createJabatanMutation = useCreateJabatanReferences()
  const createUnorMutation = useCreateUnorReferences()
  const createPendidikanMutation = useCreatePendidikanReferences()

  const batches = batchesQuery.data?.data ?? []
  const meta = batchesQuery.data?.meta

  const summary = useMemo(() => {
    return batches.reduce(
      (acc, item) => ({
        totalRows: acc.totalRows + item.totalRows,
        validRows: acc.validRows + item.validRows,
        invalidRows: acc.invalidRows + item.invalidRows,
        importedRows: acc.importedRows + item.importedRows,
      }),
      {
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        importedRows: 0,
      },
    )
  }, [batches])

  const isActionLoading =
    validateMutation.isPending ||
    commitMutation.isPending ||
    createJabatanMutation.isPending ||
    createUnorMutation.isPending ||
    createPendidikanMutation.isPending

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Integrasi Eksternal
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">
              Import Data Pegawai
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              Kelola batch import pegawai dari staging, validasi referensi SIASN,
              lengkapi referensi yang hilang, lalu commit hanya data valid ke
              tabel utama pegawai.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white">
            Flow aman: Excel → Staging → Validasi → Referensi → Commit
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Rows" value={summary.totalRows} />
        <StatCard label="Valid" value={summary.validRows} />
        <StatCard label="Invalid" value={summary.invalidRows} />
        <StatCard label="Imported" value={summary.importedRows} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Batch Import
              </h2>
              <p className="text-sm text-slate-500">
                Pilih batch untuk melihat error dan referensi yang belum lengkap.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={q}
                onChange={(event) => {
                  setQ(event.target.value)
                  setPage(1)
                }}
                placeholder="Cari batch / file..."
                className="h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-blue-500"
              />

              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value)
                  setPage(1)
                }}
                className="h-10 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="DRAFT">Draft</option>
                <option value="VALIDATED">Tervalidasi</option>
                <option value="VALIDATED_WITH_ERROR">Validasi Error</option>
                <option value="IMPORTED">Sudah Diimport</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Rows</th>
                <th className="px-4 py-3">Valid</th>
                <th className="px-4 py-3">Invalid</th>
                <th className="px-4 py-3">Imported</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Update</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batchesQuery.isLoading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={9}>
                    Memuat data batch...
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan={9}>
                    Belum ada batch import.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr
                    key={batch.id}
                    className={
                      selectedBatch?.id === batch.id
                        ? "bg-blue-50/60"
                        : "bg-white hover:bg-slate-50"
                    }
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {batch.batchCode}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{batch.fileName}</td>
                    <td className="px-4 py-3">{formatNumber(batch.totalRows)}</td>
                    <td className="px-4 py-3 text-emerald-700">
                      {formatNumber(batch.validRows)}
                    </td>
                    <td className="px-4 py-3 text-rose-700">
                      {formatNumber(batch.invalidRows)}
                    </td>
                    <td className="px-4 py-3 text-blue-700">
                      {formatNumber(batch.importedRows)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={batch.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(batch.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedBatch(batch)}
                        className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 p-4 text-sm text-slate-600">
          <div>
            Total: <strong>{formatNumber(meta?.total ?? 0)}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
            >
              Prev
            </button>
            <span>
              Page {meta?.page ?? page} / {meta?.totalPages ?? 1}
            </span>
            <button
              type="button"
              disabled={!meta || page >= meta.totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedBatch ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Error Import
                </h2>
                <p className="text-sm text-slate-500">
                  Batch: {selectedBatch.batchCode}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  disabled={isActionLoading}
                  onClick={() => validateMutation.mutate(selectedBatch.id)}
                  className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 disabled:opacity-50"
                >
                  Validasi Ulang
                </button>

                <button
                  disabled={isActionLoading || selectedBatch.status !== "VALIDATED"}
                  onClick={() => commitMutation.mutate(selectedBatch.id)}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-50"
                >
                  Commit Valid Rows
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
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
                  {errorsQuery.isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                        Memuat error...
                      </td>
                    </tr>
                  ) : (errorsQuery.data?.data ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                        Tidak ada error pada batch ini.
                      </td>
                    </tr>
                  ) : (
                    errorsQuery.data?.data.map((row) => (
                      <tr key={row.id}>
                        <td className="px-3 py-2">{row.rowNumber}</td>
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

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Missing References
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Buat referensi yang hilang dari staging, lalu validasi ulang.
            </p>

            <div className="mt-4 space-y-4">
              {[
                {
                  key: "jabatan",
                  title: "Jabatan",
                  items: missingReferencesQuery.data?.jabatan ?? [],
                  action: () => createJabatanMutation.mutate(selectedBatch.id),
                },
                {
                  key: "unor",
                  title: "UNOR",
                  items: missingReferencesQuery.data?.unor ?? [],
                  action: () => createUnorMutation.mutate(selectedBatch.id),
                },
                {
                  key: "pendidikan",
                  title: "Pendidikan",
                  items: missingReferencesQuery.data?.pendidikan ?? [],
                  action: () =>
                    createPendidikanMutation.mutate(selectedBatch.id),
                },
              ].map((group) => (
                <div
                  key={group.key}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {group.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatNumber(group.items.length)} referensi hilang
                      </div>
                    </div>

                    <button
                      disabled={isActionLoading || group.items.length === 0}
                      onClick={group.action}
                      className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                    >
                      Generate
                    </button>
                  </div>

                  <div className="mt-3 max-h-44 space-y-2 overflow-auto">
                    {group.items.length === 0 ? (
                      <div className="text-sm text-slate-500">
                        Tidak ada data hilang.
                      </div>
                    ) : (
                      group.items.slice(0, 20).map((item) => (
                        <div
                          key={item.value}
                          className="rounded-xl bg-slate-50 p-3 text-xs"
                        >
                          <div className="font-semibold text-slate-900">
                            {item.name ?? "(nama tidak tersedia)"}
                          </div>
                          <div className="mt-1 text-slate-500">
                            ID: {item.value} · {item.count} baris · contoh row:{" "}
                            {item.sampleRows.join(", ")}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}