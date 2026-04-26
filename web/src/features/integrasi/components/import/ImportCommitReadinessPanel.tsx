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
    <div className="card shadow-sm">
      <div className="card-header border-0 pt-6">
        <div className="card-title flex-column align-items-start">
          <h3 className="fw-bold text-gray-900 mb-1">Commit Readiness</h3>
          <div className="text-gray-600 fs-7">
            Pemeriksaan akhir sebelum data pegawai masuk ke master utama.
          </div>
        </div>

        <div className="card-toolbar">
          <span
            className={
              isReady
                ? "badge badge-light-success"
                : "badge badge-light-warning"
            }
          >
            {isReady ? "Ready to Commit" : "Need Fix"}
          </span>
        </div>
      </div>

      <div className="card-body pt-2">
        <div className="row g-5 mb-5">
          <div className="col-12 col-md-4">
            <div className="rounded border border-gray-300 border-dashed px-5 py-5 h-100">
              <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
                Invalid Rows
              </div>
              <div className="fw-bolder fs-2 text-danger">
                {formatNumber(batch.invalidRows)}
              </div>
              <div className="text-gray-600 fs-7 mt-1">
                Row yang masih gagal validasi.
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="rounded border border-gray-300 border-dashed px-5 py-5 h-100">
              <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
                Missing References
              </div>
              <div className="fw-bolder fs-2 text-warning">
                {loading ? "..." : formatNumber(totalMissingReferences)}
              </div>
              <div className="text-gray-600 fs-7 mt-1">
                Jabatan, UNOR, dan pendidikan yang belum cocok.
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="rounded border border-gray-300 border-dashed px-5 py-5 h-100">
              <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
                Valid Rows
              </div>
              <div className="fw-bolder fs-2 text-success">
                {formatNumber(batch.validRows)}
              </div>
              <div className="text-gray-600 fs-7 mt-1">
                Row yang siap masuk master.
              </div>
            </div>
          </div>
        </div>

        {!isReady ? (
          <div className="rounded border border-warning border-dashed bg-light-warning bg-opacity-25 px-5 py-5">
            <div className="fw-bold text-gray-900 fs-5 mb-3">
              Data belum siap commit
            </div>

            <div className="text-gray-700 fs-6 lh-lg mb-4">
              Selesaikan item berikut sebelum menjalankan commit agar data yang
              masuk ke master utama tetap bersih dan konsisten.
            </div>

            <div className="d-flex flex-column gap-3">
              {hasInvalidRows ? (
                <div className="d-flex align-items-start gap-3">
                  <span className="badge badge-light-danger mt-1">1</span>
                  <div>
                    <div className="fw-semibold text-gray-900">
                      Masih ada row invalid
                    </div>
                    <div className="text-gray-600 fs-7">
                      Terdapat {formatNumber(batch.invalidRows)} row invalid.
                      Cek Error Import, generate referensi bila perlu, lalu
                      validasi ulang.
                    </div>
                  </div>
                </div>
              ) : null}

              {hasMissingReferences ? (
                <div className="d-flex align-items-start gap-3">
                  <span className="badge badge-light-warning mt-1">2</span>
                  <div>
                    <div className="fw-semibold text-gray-900">
                      Referensi belum lengkap
                    </div>
                    <div className="text-gray-600 fs-7">
                      Jabatan: {formatNumber(missingJabatan)}, UNOR:{" "}
                      {formatNumber(missingUnor)}, Pendidikan:{" "}
                      {formatNumber(missingPendidikan)}. Generate referensi
                      yang hilang, kemudian validasi ulang batch.
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="rounded border border-success border-dashed bg-light-success bg-opacity-25 px-5 py-5">
            <div className="fw-bold text-gray-900 fs-5 mb-2">
              Data siap commit
            </div>
            <div className="text-gray-700 fs-6 lh-lg">
              Tidak ada row invalid dan referensi sudah lengkap. Tombol commit
              dapat digunakan untuk memindahkan data valid ke master pegawai.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}