import { useAsnKeluarga } from "../hooks/useAsnKeluarga"
import type { AsnAnak, AsnPasangan } from "../hooks/useAsnKeluarga"

interface Props {
  asnId: string
}

function formatTanggal(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function hitungUsia(tanggalLahir: string) {
  const lahir = new Date(tanggalLahir)
  const sekarang = new Date()
  const usia = sekarang.getFullYear() - lahir.getFullYear()
  const belumUlangTahun =
    sekarang.getMonth() < lahir.getMonth() ||
    (sekarang.getMonth() === lahir.getMonth() &&
      sekarang.getDate() < lahir.getDate())
  return belumUlangTahun ? usia - 1 : usia
}

function statusAnakBadge(statusAnak: AsnAnak["statusAnak"]) {
  if (statusAnak === "KANDUNG") return "badge-light-primary text-primary"
  if (statusAnak === "TIRI") return "badge-light-warning text-warning"
  return "badge-light-info text-info"
}

function statusPasanganBadge(status: AsnPasangan["statusPernikahan"]) {
  if (status === "AKTIF") return "badge-light-success text-success"
  if (status === "CERAI") return "badge-light-warning text-warning"
  return "badge-light-danger text-danger"
}

function tunjunganAnakBadge(usia: number) {
  if (usia < 21) return { label: "Berhak", cls: "badge-light-success text-success" }
  if (usia < 25) return { label: "Perlu verifikasi", cls: "badge-light-warning text-warning" }
  return { label: "Tidak berhak", cls: "badge-light-danger text-danger" }
}

export function AsnKeluargaTab({ asnId }: Props) {
  const { data, loading } = useAsnKeluarga(asnId)

  if (loading) {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body d-flex align-items-center justify-content-center py-12">
          <div className="spinner-border text-primary me-3" role="status" />
          <span className="text-muted fw-semibold">Memuat data keluarga...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column gap-6">
      {/* Pasangan */}
      <div className="card shadow-sm border-0">
        <div className="card-header border-0 pt-5 pb-3">
          <div className="card-title d-flex align-items-center gap-3 mb-0">
            <span className="symbol symbol-35px">
              <span className="symbol-label bg-light-primary">
                <i className="ki-duotone ki-heart fs-4 text-primary">
                  <span className="path1" />
                  <span className="path2" />
                </i>
              </span>
            </span>
            <div className="d-flex flex-column">
              <span className="fw-bolder text-gray-900">Istri / Suami</span>
              <span className="text-muted fs-7">Data pasangan yang terdaftar</span>
            </div>
          </div>
        </div>
        <div className="card-body pt-0">
          <div className="table-responsive">
            <table className="table align-middle table-row-dashed fs-6 gy-3 mb-0">
              <thead>
                <tr className="text-start text-muted fw-bolder fs-7 text-uppercase gs-0">
                  <th className="min-w-180px">Nama</th>
                  <th className="min-w-130px">Tgl Lahir</th>
                  <th className="min-w-130px">Tgl Nikah</th>
                  <th className="min-w-80px">Ke-</th>
                  <th className="min-w-100px">Status</th>
                </tr>
              </thead>
              <tbody className="fw-semibold text-gray-700">
                {data.pasangan.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-10">
                      Belum ada data pasangan
                    </td>
                  </tr>
                )}
                {data.pasangan.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-bold text-gray-900">{p.nama}</td>
                    <td>{formatTanggal(p.tanggalLahir)}</td>
                    <td>{formatTanggal(p.tanggalNikah)}</td>
                    <td>{p.urutanPernikahan} (
                      {p.urutanPernikahan === 1 ? "SATU" :
                       p.urutanPernikahan === 2 ? "DUA" : String(p.urutanPernikahan)}
                    )</td>
                    <td>
                      <span className={`badge fw-bold fs-8 ${statusPasanganBadge(p.statusPernikahan)}`}>
                        {p.statusPernikahan}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Anak */}
      <div className="card shadow-sm border-0">
        <div className="card-header border-0 pt-5 pb-3">
          <div className="card-title d-flex align-items-center gap-3 mb-0">
            <span className="symbol symbol-35px">
              <span className="symbol-label bg-light-success">
                <i className="ki-duotone ki-people fs-4 text-success">
                  <span className="path1" />
                  <span className="path2" />
                  <span className="path3" />
                  <span className="path4" />
                  <span className="path5" />
                </i>
              </span>
            </span>
            <div className="d-flex flex-column">
              <span className="fw-bolder text-gray-900">Anak</span>
              <span className="text-muted fs-7">
                Data anak — usia &lt; 25 th berpotensi berhak tunjangan
              </span>
            </div>
          </div>
        </div>
        <div className="card-body pt-0">
          <div className="table-responsive">
            <table className="table align-middle table-row-dashed fs-6 gy-3 mb-0">
              <thead>
                <tr className="text-start text-muted fw-bolder fs-7 text-uppercase gs-0">
                  <th className="min-w-200px">Nama</th>
                  <th className="min-w-130px">Tgl Lahir</th>
                  <th className="min-w-60px">Usia</th>
                  <th className="min-w-100px">Status</th>
                  <th className="min-w-130px">Tunjangan</th>
                  <th className="min-w-160px">Nama Ayah / Ibu</th>
                </tr>
              </thead>
              <tbody className="fw-semibold text-gray-700">
                {data.anak.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-10">
                      Belum ada data anak
                    </td>
                  </tr>
                )}
                {data.anak.map((a) => {
                  const usia = hitungUsia(a.tanggalLahir)
                  const tunjangan = tunjunganAnakBadge(usia)

                  return (
                    <tr key={a.id}>
                      <td className="fw-bold text-gray-900">{a.nama}</td>
                      <td>{formatTanggal(a.tanggalLahir)}</td>
                      <td>{usia} th</td>
                      <td>
                        <span className={`badge fw-bold fs-8 ${statusAnakBadge(a.statusAnak)}`}>
                          {a.statusAnak}
                        </span>
                      </td>
                      <td>
                        <span className={`badge fw-bold fs-8 ${tunjangan.cls}`}>
                          {tunjangan.label}
                        </span>
                      </td>
                      <td className="text-muted fs-7">
                        {a.namaAyah ?? "-"} / {a.namaIbu ?? "-"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
