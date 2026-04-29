// web/src/features/profil-asn/components/AsnFilterBar.tsx
import type { ReactNode } from "react"

interface Props {
  search: string
  jabatan: string
  hideUnorFilter?: boolean
  fixedUnorLabel?: string
  unorPicker?: ReactNode
  onSearch: (value: string) => void
  onJabatan: (value: string) => void
  onReset: () => void
}

function ToolbarControl({
  iconClass,
  label,
  children,
}: {
  iconClass: string
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-2">
        <i className={`${iconClass} fs-4 text-primary`}>
          <span className="path1" />
          <span className="path2" />
          <span className="path3" />
        </i>
        <label className="form-label mb-0 fw-bold text-gray-700 fs-8 text-uppercase">
          {label}
        </label>
      </div>
      {children}
    </div>
  )
}

export function AsnFilterBar({
  search,
  jabatan,
  hideUnorFilter = false,
  fixedUnorLabel,
  unorPicker,
  onSearch,
  onJabatan,
  onReset,
}: Props) {
  return (
    <div className="card shadow-sm border-0 mb-6">
      <div className="card-body p-4 p-lg-5">
        <div className="row g-4 align-items-end">
          <div className="col-12 col-xl-4">
            <ToolbarControl
              iconClass="ki-duotone ki-geolocation-home"
              label="Unit Organisasi"
            >
              {hideUnorFilter ? (
                <div className="form-control form-control-lg form-control-solid d-flex align-items-center text-gray-700 fw-semibold">
                  {fixedUnorLabel ?? "Data dibatasi pada OPD aktif"}
                </div>
              ) : (
                unorPicker
              )}
            </ToolbarControl>
          </div>

          <div className="col-12 col-xl-4">
            <ToolbarControl
              iconClass="ki-duotone ki-magnifier"
              label="Cari ASN"
            >
              <div className="position-relative">
                <i className="ki-duotone ki-magnifier fs-2 text-gray-500 position-absolute top-50 translate-middle-y ms-5">
                  <span className="path1" />
                  <span className="path2" />
                </i>
                <input
                  type="text"
                  className="form-control form-control-lg form-control-solid ps-13"
                  placeholder="Cari NIP atau nama ASN..."
                  value={search}
                  onChange={(event) => onSearch(event.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </ToolbarControl>
          </div>

          <div className="col-12 col-lg-9 col-xl-3">
            <ToolbarControl
              iconClass="ki-duotone ki-filter"
              label="Jenis Jabatan"
            >
              <select
                className="form-select form-select-lg form-select-solid"
                value={jabatan}
                onChange={(event) => onJabatan(event.target.value)}
              >
                <option value="">Semua Jabatan</option>
                <option value="STRUKTURAL">Struktural</option>
                <option value="FUNGSIONAL">Fungsional</option>
                <option value="PELAKSANA">Pelaksana</option>
              </select>
            </ToolbarControl>
          </div>

          <div className="col-12 col-lg-3 col-xl-auto">
            <button
              type="button"
              className="btn btn-light-primary w-100 text-nowrap px-5 h-50px"
              style={{ minWidth: 112 }}
              onClick={onReset}
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}