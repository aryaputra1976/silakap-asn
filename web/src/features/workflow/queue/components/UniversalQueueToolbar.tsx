interface Props {
  value: {
    search: string
    status: string
    jenis: string
  }
  serviceOptions: Array<{
    kode: string
    nama: string
  }>
  onChange: (filters: {
    search: string
    status: string
    jenis: string
  }) => void
  onApply: () => void
  onReset: () => void
}

const STATUS_OPTIONS = [
  { label: "Semua Status", value: "" },
  { label: "Diajukan", value: "SUBMITTED" },
  { label: "Review", value: "IN_REVIEW" },
  { label: "Terverifikasi", value: "VERIFIED" },
  { label: "Dikembalikan", value: "RETURNED" },
  { label: "Disetujui", value: "APPROVED" },
]

export function UniversalQueueToolbar({
  value,
  serviceOptions,
  onChange,
  onApply,
  onReset,
}: Props) {
  return (
    <div className="rounded-4 border border-gray-200 bg-light-primary bg-opacity-10 px-5 py-5 mb-6">
      <div className="text-gray-900 fw-bold fs-5 mb-2">Filter Antrian</div>
      <div className="text-muted fs-7 mb-4">
        Cari usulan berdasarkan ASN atau sempitkan hasil berdasarkan status dan layanan
        yang sedang Anda tangani.
      </div>

      <div className="row g-4 align-items-end">
        <div className="col-12 col-xl-6">
          <label className="form-label fw-semibold">Cari NIP / Nama</label>
          <div className="d-flex gap-3">
            <input
              className="form-control"
              placeholder="Masukkan NIP, nama ASN, atau layanan"
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

        <div className="col-12 col-md-6 col-xl-3">
          <label className="form-label fw-semibold">Status</label>
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

        <div className="col-12 col-md-6 col-xl-3">
          <label className="form-label fw-semibold">Layanan</label>
          <select
            className="form-select"
            value={value.jenis}
            onChange={(event) =>
              onChange({
                ...value,
                jenis: event.target.value,
              })
            }
          >
            <option value="">Semua Layanan</option>
            {serviceOptions.map((item) => (
              <option key={item.kode} value={item.kode}>
                {item.nama}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  )
}
