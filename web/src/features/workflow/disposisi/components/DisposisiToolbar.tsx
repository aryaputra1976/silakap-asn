interface Props {
  value: {
    search: string
    status: string
  }
  onChange: (value: { search: string; status: string }) => void
  onApply: () => void
  onReset: () => void
}

const STATUS_OPTIONS = [
  { label: "Semua Status", value: "" },
  { label: "Sent", value: "SENT" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Done", value: "DONE" },
]

export function DisposisiToolbar({ value, onChange, onApply, onReset }: Props) {
  return (
    <div className="rounded-4 border border-gray-200 bg-light-primary bg-opacity-10 px-5 py-5 mb-6">
      <div className="text-gray-900 fw-bold fs-5 mb-2">Filter Disposisi</div>
      <div className="text-muted fs-7 mb-4">
        Cari disposisi berdasarkan ASN, layanan, atau role tujuan, lalu sempitkan hasil
        berdasarkan status disposisi yang sedang berjalan.
      </div>

      <div className="row g-4 align-items-end">
        <div className="col-12 col-xl-7">
          <label className="form-label fw-semibold">Cari ASN / Layanan / Role</label>
          <div className="d-flex gap-3">
            <input
              className="form-control"
              placeholder="Masukkan nama ASN, NIP, layanan, role, atau catatan"
              value={value.search}
              onChange={(event) =>
                onChange({
                  ...value,
                  search: event.target.value,
                })
              }
            />
            <button
              type="button"
              className="btn btn-primary flex-shrink-0 text-nowrap"
              style={{ minWidth: 110 }}
              onClick={onApply}
            >
              Cari
            </button>
            <button
              type="button"
              className="btn btn-light flex-shrink-0 text-nowrap"
              style={{ minWidth: 110 }}
              onClick={onReset}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <label className="form-label fw-semibold">Status Disposisi</label>
          <select
            className="form-select"
            value={value.status}
            onChange={(event) =>
              onChange({
                ...value,
                status: event.target.value,
              })
            }
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
