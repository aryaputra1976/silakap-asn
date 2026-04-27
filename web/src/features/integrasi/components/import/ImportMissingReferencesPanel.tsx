import type { MissingReferencesResponse } from "../../types"
import { formatNumber } from "./import-ui"

const REFERENCE_IMPORT_HREF = "/integrasi/import-referensi"

type ReferenceGroupKind = "jabatan" | "unor" | "pendidikan"

type MissingReferenceGroup = {
  key: ReferenceGroupKind
  title: string
  description: string
  items: MissingReferencesResponse["jabatan"]
  loading: boolean
  action: () => void
  isBlocking: boolean
}

type ImportMissingReferencesPanelProps = {
  data?: MissingReferencesResponse
  loading: boolean
  disabled: boolean
  jabatanLoading: boolean
  unorLoading: boolean
  pendidikanLoading: boolean
  onCreateJabatan: () => void
  onCreateUnor: () => void
  onCreatePendidikan: () => void
}

function MissingReferenceCard({
  group,
  disabled,
  panelLoading,
}: {
  group: MissingReferenceGroup
  disabled: boolean
  panelLoading: boolean
}) {
  const total = group.items.length
  const hasItems = total > 0

  return (
    <div
      className={`rounded border border-dashed px-5 py-5 ${
        group.isBlocking && hasItems
          ? "border-danger bg-light-danger bg-opacity-10"
          : "border-gray-300 bg-light-primary bg-opacity-10"
      }`}
    >
      <div className="d-flex align-items-start justify-content-between gap-4 mb-4">
        <div>
          <div className="fw-bold text-gray-900 fs-5">{group.title}</div>
          <div className="text-gray-600 fs-7 lh-lg">{group.description}</div>
        </div>

        <div className="d-flex flex-column align-items-end gap-1">
          {group.isBlocking ? (
            <span className={hasItems ? "badge badge-light-danger" : "badge badge-light-success"}>
              {hasItems ? "WAJIB · Memblok commit" : "Lengkap"}
            </span>
          ) : (
            <span className={hasItems ? "badge badge-light-info" : "badge badge-light-success"}>
              {hasItems ? "Opsional" : "Lengkap"}
            </span>
          )}
          <span className="text-gray-500 fs-8">{formatNumber(total)} data</span>
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-between gap-3 mb-4">
        <div className="text-gray-600 fs-7">
          {!hasItems
            ? "Tidak ada referensi hilang untuk kategori ini."
            : group.isBlocking
            ? "Referensi ini wajib ada sebelum commit. Lengkapi melalui halaman Import Referensi."
            : "Referensi dapat digenerate otomatis dan tidak memblok commit."}
        </div>

        {group.isBlocking ? (
          <a
            href={REFERENCE_IMPORT_HREF}
            className={`btn btn-sm ${hasItems ? "btn-light-danger" : "btn-light"}`}
          >
            Buka Import Referensi →
          </a>
        ) : (
          <button
            type="button"
            disabled={disabled || panelLoading || !hasItems}
            onClick={group.action}
            className="btn btn-sm btn-light-primary"
          >
            {group.loading ? "Memproses..." : "Generate Otomatis"}
          </button>
        )}
      </div>

      <div className="separator separator-dashed my-4" />

      <div className="mh-200px overflow-auto pe-2">
        {panelLoading ? (
          <div className="text-gray-500 fs-7">Memuat referensi...</div>
        ) : !hasItems ? (
          <div className="text-gray-500 fs-7">Data kosong.</div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {group.items.slice(0, 20).map((item) => (
              <div
                key={item.value}
                className="rounded bg-white px-4 py-3 border border-gray-200"
              >
                <div className="fw-bold text-gray-900 fs-7">
                  {item.name ?? "(nama tidak tersedia)"}
                </div>

                <div className="text-gray-600 fs-8 mt-1">
                  ID: <span className="fw-semibold">{item.value}</span>
                </div>

                <div className="d-flex flex-wrap gap-2 mt-2">
                  <span className="badge badge-light-dark">
                    {formatNumber(item.count)} baris
                  </span>

                  {item.sampleRows.length > 0 ? (
                    <span className="badge badge-light-info">
                      contoh row: {item.sampleRows.slice(0, 5).join(", ")}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}

            {group.items.length > 20 ? (
              <div className="text-gray-500 fs-8">
                Menampilkan 20 dari {formatNumber(group.items.length)} data.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export function ImportMissingReferencesPanel({
  data,
  loading,
  disabled,
  jabatanLoading,
  unorLoading,
  pendidikanLoading,
  onCreateJabatan,
  onCreateUnor,
  onCreatePendidikan,
}: ImportMissingReferencesPanelProps) {
  const groups: MissingReferenceGroup[] = [
    {
      key: "jabatan",
      title: "Jabatan",
      description: "Referensi jabatan yang belum ditemukan saat validasi import.",
      items: data?.jabatan ?? [],
      loading: jabatanLoading,
      action: onCreateJabatan,
      isBlocking: true,
    },
    {
      key: "unor",
      title: "UNOR",
      description: "Referensi unit organisasi yang belum tersedia pada master.",
      items: data?.unor ?? [],
      loading: unorLoading,
      action: onCreateUnor,
      isBlocking: true,
    },
    {
      key: "pendidikan",
      title: "Pendidikan",
      description: "Referensi pendidikan yang belum cocok dengan master.",
      items: data?.pendidikan ?? [],
      loading: pendidikanLoading,
      action: onCreatePendidikan,
      isBlocking: false,
    },
  ]

  const blockingMissing = (data?.jabatan.length ?? 0) + (data?.unor.length ?? 0)
  const totalMissing = blockingMissing + (data?.pendidikan.length ?? 0)

  return (
    <div className="card shadow-sm h-100">
      <div className="card-header border-0 pt-6">
        <div className="card-title flex-column align-items-start">
          <h3 className="fw-bold text-gray-900 mb-1">Missing References</h3>
          <div className="text-gray-600 fs-7">
            Referensi wajib (Jabatan, UNOR) harus dilengkapi sebelum commit.
          </div>
        </div>

        <div className="card-toolbar">
          <span
            className={
              blockingMissing > 0
                ? "badge badge-light-danger"
                : totalMissing > 0
                ? "badge badge-light-info"
                : "badge badge-light-success"
            }
          >
            {blockingMissing > 0
              ? `${formatNumber(blockingMissing)} wajib belum lengkap`
              : totalMissing > 0
              ? `${formatNumber(totalMissing)} opsional`
              : "Semua referensi lengkap"}
          </span>
        </div>
      </div>

      <div className="card-body pt-2">
        <div className="d-flex flex-column gap-5">
          {groups.map((group) => (
            <MissingReferenceCard
              key={group.key}
              group={group}
              disabled={disabled}
              panelLoading={loading}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
