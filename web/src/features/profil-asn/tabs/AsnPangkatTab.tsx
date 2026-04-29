import { useAsnPangkat } from "../hooks/useAsnPangkat"

interface Props {
  asnId: string
}

function formatTanggal(value?: string | null) {
  if (!value) return "-"
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function hitungMasaKerja(tmt: string) {
  const start = new Date(tmt)
  const now = new Date()

  let years = now.getFullYear() - start.getFullYear()
  let months = now.getMonth() - start.getMonth()

  if (months < 0) {
    years -= 1
    months += 12
  }

  return `${years} Tahun ${months} Bulan`
}

function golonganColor(golongan?: string | null) {
  if (!golongan) return "badge-light-secondary text-muted"
  if (golongan.startsWith("IV")) return "badge-light-danger text-danger"
  if (golongan.startsWith("III")) return "badge-light-warning text-warning"
  if (golongan.startsWith("II")) return "badge-light-primary text-primary"
  return "badge-light-secondary text-gray-700"
}

export function AsnPangkatTab({ asnId }: Props) {
  const { data, loading } = useAsnPangkat(asnId)

  if (loading) {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body d-flex align-items-center justify-content-center py-12">
          <div className="spinner-border text-primary me-3" role="status" />
          <span className="text-muted fw-semibold">Memuat riwayat pangkat...</span>
        </div>
      </div>
    )
  }

  const latest = data[0]

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header border-0 pt-5 pb-3">
        <div className="card-title fw-bolder text-gray-900">
          Riwayat Pangkat / Golongan
          {data.length > 0 && (
            <span className="badge badge-light-primary fw-bold fs-8 ms-3">
              {data.length} entri
            </span>
          )}
        </div>
        {latest && (
          <div className="card-toolbar d-flex gap-3">
            <div className="d-flex flex-column text-end">
              <span className="text-muted fs-8 text-uppercase fw-semibold">Pangkat Terakhir</span>
              <span className={`badge fw-bolder fs-7 ${golonganColor(latest.golongan)}`}>
                {latest.golongan ?? "-"}
              </span>
            </div>
            <div className="d-flex flex-column text-end">
              <span className="text-muted fs-8 text-uppercase fw-semibold">Masa Kerja Gol.</span>
              <span className="fw-bolder text-gray-900 fs-7">
                {hitungMasaKerja(latest.tmt)}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="card-body pt-0">
        <div className="table-responsive">
          <table className="table align-middle table-row-dashed fs-6 gy-3 mb-0">
            <thead>
              <tr className="text-start text-muted fw-bolder fs-7 text-uppercase gs-0">
                <th className="min-w-130px">TMT Pangkat</th>
                <th className="min-w-120px">Golongan</th>
                <th className="min-w-150px">Masa Kerja Gol.</th>
                <th className="min-w-130px">No SK</th>
                <th className="min-w-130px">Tgl SK</th>
              </tr>
            </thead>
            <tbody className="fw-semibold text-gray-700">
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-10">
                    Belum ada data riwayat pangkat
                  </td>
                </tr>
              )}
              {data.map((row, idx) => (
                <tr key={row.id} className={idx === 0 ? "bg-light-primary" : ""}>
                  <td className="text-nowrap">{formatTanggal(row.tmt)}</td>
                  <td>
                    <span className={`badge fw-bold fs-8 ${golonganColor(row.golongan)}`}>
                      {row.golongan ?? "-"}
                    </span>
                  </td>
                  <td className="text-muted fs-7">{hitungMasaKerja(row.tmt)}</td>
                  <td className="text-muted fs-7">{row.nomorSk ?? "-"}</td>
                  <td className="text-muted fs-7">{formatTanggal(row.tanggalSk)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
