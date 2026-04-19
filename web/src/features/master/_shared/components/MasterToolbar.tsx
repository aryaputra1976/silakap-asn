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
  canCreate = false, // default aman
  onSearchChange,
  onStatusChange,
  onCreate,
}: Props) {
  return (
    <div className="card-header border-0 pt-6 d-flex justify-content-between align-items-center">

      {/* LEFT SIDE */}
      <div className="d-flex align-items-center gap-3">

        {/* Search */}
        <div className="position-relative">
          <KTIcon
            iconName="magnifier"
            className="fs-3 position-absolute ms-4 mt-3 text-gray-400"
          />
          <input
            type="text"
            className="form-control form-control-solid w-250px ps-11"
            placeholder={`Cari ${title}`}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <select
          className="form-select form-select-solid w-150px"
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

      {/* RIGHT SIDE */}
      <div>
        {canCreate && (
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={onCreate}
          >
            <KTIcon iconName="plus" className="fs-2" />
            Tambah {title}
          </button>
        )}
      </div>
    </div>
  )
}