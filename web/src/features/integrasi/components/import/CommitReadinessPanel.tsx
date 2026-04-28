import type { CommitReadiness } from "../../types"
import { formatNumber } from "./import-ui"

type CommitReadinessPanelProps = {
  readiness: CommitReadiness
  loading: boolean
  onGoToValidation?: () => void
  onGoToReference?: () => void
}

export function CommitReadinessPanel({
  readiness,
  loading,
  onGoToValidation,
  onGoToReference,
}: CommitReadinessPanelProps) {
  if (loading) {
    return (
      <div className="card shadow-sm mb-6">
        <div className="card-body py-8 text-center text-gray-500 fs-7">
          Memeriksa kesiapan commit...
        </div>
      </div>
    )
  }

  const { isReady, invalidRows, missingJabatan, missingUnor, missingPendidikan, blockingReasons } = readiness
  const totalMissing = missingJabatan + missingUnor + missingPendidikan

  return (
    <div className="card shadow-sm mb-6">
      <div className="card-header border-0 pt-5">
        <div className="card-title flex-column align-items-start">
          <h3 className="fw-bold text-gray-900 mb-1">Kesiapan Commit</h3>
          <div className="text-gray-600 fs-7">
            Pemeriksaan akhir sebelum data masuk ke master pegawai.
          </div>
        </div>
        <div className="card-toolbar">
          <span className={isReady ? "badge badge-light-success" : "badge badge-light-warning"}>
            {isReady ? "Siap Commit" : "Belum Siap"}
          </span>
        </div>
      </div>

      <div className="card-body pt-3">
        <div className="row g-4 mb-5">
          <div className="col-12 col-md-4">
            <div className="rounded border border-dashed border-gray-300 px-5 py-4 h-100">
              <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-1">Baris Invalid</div>
              <div className={`fw-bolder fs-2x ${invalidRows > 0 ? "text-danger" : "text-success"}`}>
                {formatNumber(invalidRows)}
              </div>
              <div className="text-gray-500 fs-8 mt-1">Harus nol sebelum commit.</div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="rounded border border-dashed border-gray-300 px-5 py-4 h-100">
              <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-1">Referensi Hilang</div>
              <div className={`fw-bolder fs-2x ${totalMissing > 0 ? "text-warning" : "text-success"}`}>
                {formatNumber(totalMissing)}
              </div>
              <div className="text-gray-500 fs-8 mt-1">
                Jabatan {formatNumber(missingJabatan)} · UNOR {formatNumber(missingUnor)} · Pendidikan {formatNumber(missingPendidikan)}
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className={`rounded border border-dashed px-5 py-4 h-100 ${isReady ? "border-success bg-light-success bg-opacity-25" : "border-gray-300"}`}>
              <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-1">Status</div>
              <div className={`fw-bolder fs-4 ${isReady ? "text-success" : "text-warning"}`}>
                {isReady ? "✓ Siap" : "Perlu Tindakan"}
              </div>
              <div className="text-gray-500 fs-8 mt-1">
                {isReady ? "Semua pemeriksaan lolos." : `${blockingReasons.length} masalah ditemukan.`}
              </div>
            </div>
          </div>
        </div>

        {isReady ? (
          <div className="rounded border border-success border-dashed bg-light-success bg-opacity-25 px-5 py-4">
            <div className="fw-bold text-gray-900 fs-6 mb-1">Data siap commit</div>
            <div className="text-gray-700 fs-7">
              Tidak ada baris invalid dan referensi wajib sudah lengkap.
              {missingPendidikan > 0
                ? ` Catatan: ${formatNumber(missingPendidikan)} referensi pendidikan akan dibuat otomatis saat commit.`
                : ""}
            </div>
          </div>
        ) : (
          <div className="rounded border border-warning border-dashed bg-light-warning bg-opacity-10 px-5 py-5">
            <div className="fw-bold text-gray-900 fs-6 mb-3">Selesaikan masalah berikut sebelum commit</div>
            <div className="d-flex flex-column gap-3">
              {blockingReasons.map((reason, idx) => (
                <div key={reason.key} className="d-flex align-items-start gap-3">
                  <span className="badge badge-circle badge-light-danger mt-1 flex-shrink-0">{idx + 1}</span>
                  <div className="flex-grow-1">
                    <div className="fw-semibold text-gray-900 fs-7">{reason.label}</div>
                    <div className="text-gray-600 fs-8 mt-1">{reason.detail}</div>
                    {reason.key === "invalidRows" && onGoToValidation ? (
                      <button
                        type="button"
                        onClick={onGoToValidation}
                        className="btn btn-xs btn-light-danger mt-2"
                      >
                        Lihat Baris Error →
                      </button>
                    ) : null}
                    {(reason.key === "jabatan" || reason.key === "unor") && onGoToReference ? (
                      <button
                        type="button"
                        onClick={onGoToReference}
                        className="btn btn-xs btn-light-warning mt-2"
                      >
                        Ke Halaman Referensi →
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}

              {missingPendidikan > 0 && !blockingReasons.some((r) => r.key === "pendidikan") ? (
                <div className="d-flex align-items-start gap-3 opacity-75">
                  <span className="badge badge-circle badge-light-info mt-1 flex-shrink-0">i</span>
                  <div>
                    <div className="fw-semibold text-gray-700 fs-7">
                      {formatNumber(missingPendidikan)} referensi pendidikan hilang
                    </div>
                    <div className="text-gray-500 fs-8 mt-1">
                      Tidak memblokir commit — akan dibuat otomatis saat commit dijalankan.
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
