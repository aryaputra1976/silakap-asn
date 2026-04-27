import type { ImportBatchItem, MissingReferencesResponse } from "../types"
import { formatNumber } from "../components/import/import-ui"

type BatchImportReferenceResolveStepProps = {
  batch: ImportBatchItem
  missingReferences?: MissingReferencesResponse
  loading: boolean
  disabled: boolean
  pendidikanLoading: boolean
  onCreatePendidikan: () => void
  onNext: () => void
}

type RefSectionProps = {
  title: string
  description: string
  items: MissingReferencesResponse["jabatan"]
  loading: boolean
  action: React.ReactNode
  blockingNote?: string
}

function RefSection({ title, description, items, loading, action, blockingNote }: RefSectionProps) {
  const count = items.length

  return (
    <div className="card shadow-sm">
      <div className="card-header border-0 pt-5">
        <div className="card-title flex-column align-items-start">
          <h3 className="fw-bold text-gray-900 mb-1">{title}</h3>
          <div className="text-gray-600 fs-7">{description}</div>
        </div>
        <div className="card-toolbar">
          <span className={count > 0 ? "badge badge-light-warning" : "badge badge-light-success"}>
            {formatNumber(count)} data
          </span>
        </div>
      </div>
      <div className="card-body pt-2">
        {count === 0 ? (
          <div className="rounded border border-success border-dashed bg-light-success bg-opacity-10 px-5 py-4">
            <div className="text-success fs-7 fw-semibold">Tidak ada referensi hilang untuk kategori ini.</div>
          </div>
        ) : (
          <>
            {blockingNote ? (
              <div className="rounded border border-danger border-dashed bg-light-danger bg-opacity-10 px-5 py-4 mb-4">
                <div className="fw-bold text-danger fs-7 mb-1">⚠ Memblokir Commit</div>
                <div className="text-gray-700 fs-8">{blockingNote}</div>
              </div>
            ) : null}

            <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="text-gray-600 fs-7">
                {formatNumber(count)} referensi perlu diselesaikan sebelum commit.
              </div>
              {action}
            </div>

            <div className="mh-200px overflow-auto pe-1">
              {loading ? (
                <div className="text-gray-500 fs-7">Memuat...</div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {items.slice(0, 20).map((item) => (
                    <div
                      key={item.value}
                      className="rounded bg-light px-4 py-3 border border-gray-200"
                    >
                      <div className="fw-bold text-gray-900 fs-7">
                        {item.name ?? "(nama tidak tersedia)"}
                      </div>
                      <div className="text-gray-500 fs-9 mt-1">ID: {item.value}</div>
                      <div className="d-flex gap-2 mt-2">
                        <span className="badge badge-light-dark fs-9">
                          {formatNumber(item.count)} baris
                        </span>
                        {item.sampleRows.length > 0 ? (
                          <span className="badge badge-light-info fs-9">
                            contoh: baris {item.sampleRows.slice(0, 5).join(", ")}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                  {items.length > 20 ? (
                    <div className="text-gray-500 fs-8">
                      Menampilkan 20 dari {formatNumber(items.length)} data.
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export function BatchImportReferenceResolveStep({
  missingReferences,
  loading,
  disabled,
  pendidikanLoading,
  onCreatePendidikan,
  onNext,
}: BatchImportReferenceResolveStepProps) {
  const jabatanItems = missingReferences?.jabatan ?? []
  const unorItems = missingReferences?.unor ?? []
  const pendidikanItems = missingReferences?.pendidikan ?? []

  const jabatanBlocked = jabatanItems.length > 0
  const unorBlocked = unorItems.length > 0
  const canProceed = !jabatanBlocked && !unorBlocked

  return (
    <div className="d-flex flex-column gap-6">
      <div className="alert alert-dismissible d-flex align-items-center bg-light-warning border border-warning border-dashed p-5 mb-0">
        <div className="d-flex flex-column">
          <span className="fw-bold text-dark fs-7 mb-1">Cara menyelesaikan referensi hilang</span>
          <span className="text-gray-700 fs-8">
            Jabatan dan UNOR wajib diimport terlebih dahulu via halaman{" "}
            <a href="/integrasi/import-referensi" className="fw-bold text-primary">
              Import Referensi
            </a>
            {" "}sebelum commit. Referensi pendidikan dapat dibuat otomatis di sini.
          </span>
        </div>
      </div>

      <RefSection
        title="Jabatan"
        description="Referensi jabatan yang belum ada di master ref_jabatan."
        items={jabatanItems}
        loading={loading}
        blockingNote={
          jabatanItems.length > 0
            ? "Jabatan hilang memblokir commit. Gunakan halaman Import Referensi untuk mengimport data jabatan dari file BKN, kemudian validasi ulang batch ini."
            : undefined
        }
        action={
          jabatanItems.length > 0 ? (
            <a
              href="/integrasi/import-referensi"
              className="btn btn-sm btn-warning"
            >
              Import Referensi Jabatan →
            </a>
          ) : null
        }
      />

      <RefSection
        title="UNOR (Unit Organisasi)"
        description="Referensi unit organisasi yang belum ada di master ref_unor."
        items={unorItems}
        loading={loading}
        blockingNote={
          unorItems.length > 0
            ? "UNOR hilang memblokir commit. Gunakan halaman Import Referensi untuk mengimport data UNOR dari file BKN, kemudian validasi ulang batch ini."
            : undefined
        }
        action={
          unorItems.length > 0 ? (
            <a
              href="/integrasi/import-referensi"
              className="btn btn-sm btn-warning"
            >
              Import Referensi UNOR →
            </a>
          ) : null
        }
      />

      <RefSection
        title="Pendidikan"
        description="Referensi pendidikan yang belum ada di master ref_pendidikan."
        items={pendidikanItems}
        loading={loading}
        action={
          pendidikanItems.length > 0 ? (
            <button
              type="button"
              disabled={disabled || pendidikanLoading}
              onClick={onCreatePendidikan}
              className="btn btn-sm btn-light-primary"
            >
              {pendidikanLoading ? "Memproses..." : "Generate Pendidikan"}
            </button>
          ) : null
        }
      />

      <div className="card shadow-sm">
        <div className="card-body py-5 px-6">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-4">
            <div>
              {canProceed ? (
                <>
                  <div className="fw-bold text-gray-900 fs-6 mb-1">Referensi wajib sudah lengkap</div>
                  <div className="text-gray-600 fs-7">
                    Jabatan dan UNOR tidak ada yang hilang. Lanjut ke tahap review.
                  </div>
                </>
              ) : (
                <>
                  <div className="fw-bold text-warning fs-6 mb-1">Masih ada referensi wajib yang hilang</div>
                  <div className="text-gray-600 fs-7">
                    Import referensi jabatan dan/atau UNOR terlebih dahulu via halaman Import Referensi.
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              disabled={!canProceed}
              onClick={onNext}
              className={canProceed ? "btn btn-primary" : "btn btn-light-secondary"}
            >
              {canProceed ? "Lanjut ke Review →" : "Selesaikan Referensi Dahulu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
