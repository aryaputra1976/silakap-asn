import { KTIcon } from "@/_metronic/helpers"

type StatusFilter = "" | "active" | "inactive"

type Props = {
  title: string
  search: string
  status?: StatusFilter
  canCreate?: boolean
  onSearchChange: (value: string) => void
  onStatusChange: (value: StatusFilter) => void
  onCreate: () => void
}

export function MasterToolbar({
  title,
  search,
  status,
  canCreate = false,
  onSearchChange,
  onStatusChange,
  onCreate,
}: Props) {
  return (
    <div className="card-header border-0 pt-6 pb-2">
      <div className="d-flex flex-column gap-5 w-100">
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
          <div>
            <div className="fw-bold fs-4 text-gray-900 mb-1">
              Data Master {title}
            </div>
            <div className="text-gray-600 fs-7">
              Kelola referensi aktif, lakukan pencarian cepat, dan jaga
              konsistensi data lintas modul.
            </div>
          </div>

          {canCreate && (
            <button
              className="btn btn-primary d-inline-flex align-items-center gap-2 align-self-start align-self-lg-center"
              onClick={onCreate}
            >
              <KTIcon iconName="plus" className="fs-2" />
              Tambah {title}
            </button>
          )}
        </div>

        <div className="d-flex flex-column flex-xl-row align-items-stretch gap-3">
          <div className="position-relative flex-grow-1">
            <KTIcon
              iconName="magnifier"
              className="fs-3 position-absolute ms-4 top-50 translate-middle-y text-gray-400"
            />
            <input
              type="text"
              className="form-control form-control-solid ps-11"
              placeholder={`Cari kode atau nama ${title.toLowerCase()}`}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div className="w-100 w-xl-225px">
            <select
              className="form-select form-select-solid"
              value={status ?? ""}
              onChange={(e) =>
                onStatusChange(e.target.value as StatusFilter)
              }
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
