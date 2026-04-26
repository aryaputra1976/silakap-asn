import type { ImportBatchItem, MissingReferencesResponse } from "../../types"
import { formatNumber } from "./import-ui"

type ImportCommitReadinessPanelProps = {
  batch: ImportBatchItem | null
  missingReferences?: MissingReferencesResponse
  loading: boolean
}

export function ImportCommitReadinessPanel({
  batch,
  missingReferences,
  loading,
}: ImportCommitReadinessPanelProps) {
  if (!batch) {
    return null
  }

  const missingJabatan = missingReferences?.jabatan.length ?? 0
  const missingUnor = missingReferences?.unor.length ?? 0
  const missingPendidikan = missingReferences?.pendidikan.length ?? 0
  const totalMissingReferences =
    missingJabatan + missingUnor + missingPendidikan

  const hasInvalidRows = batch.invalidRows > 0
  const hasMissingReferences = totalMissingReferences > 0
  const isReady = !hasInvalidRows && !hasMissingReferences

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Commit Readiness
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Pemeriksaan kesiapan sebelum data pegawai masuk ke master utama.
          </p>
        </div>

        <span
          className={
            isReady
              ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200"
              : "rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200"
          }
        >
          {isReady ? "Ready to Commit" : "Need Fix"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Invalid Rows</p>
          <p className="mt-1 text-xl font-bold text-rose-700">
            {formatNumber(batch.invalidRows)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Missing References</p>
          <p className="mt-1 text-xl font-bold text-amber-700">
            {loading ? "..." : formatNumber(totalMissingReferences)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Valid Rows</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">
            {formatNumber(batch.validRows)}
          </p>
        </div>
      </div>

      {!isReady ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Data belum siap commit.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {hasInvalidRows ? (
              <li>
                Masih ada {formatNumber(batch.invalidRows)} row invalid. Cek
                tabel error import.
              </li>
            ) : null}
            {hasMissingReferences ? (
              <li>
                Masih ada referensi hilang: Jabatan {missingJabatan}, UNOR{" "}
                {missingUnor}, Pendidikan {missingPendidikan}. Generate
                referensi lalu validasi ulang.
              </li>
            ) : null}
          </ul>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Data sudah siap. Tombol commit dapat digunakan.
        </div>
      )}
    </div>
  )
}