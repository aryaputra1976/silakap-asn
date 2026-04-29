import { Link } from "react-router-dom"

import { useServiceDashboard } from "../../../base/dashboard/hooks/useServiceDashboard"

function StatBadge({
  label,
  value,
  className,
}: {
  label: string
  value: number
  className: string
}) {
  return (
    <span className={`badge fw-bold fs-8 px-4 py-2 ${className}`}>
      {label} {value}
    </span>
  )
}

function getStat(stats: Array<{ status: string; count: number }>, status: string) {
  return (
    stats.find((item) => item.status.toUpperCase() === status)?.count ?? 0
  )
}

export default function PeremajaanDashboard() {
  const { data, loading, error } = useServiceDashboard("peremajaan")
  const stats = data?.stats ?? []
  const recent = data?.recent ?? []

  const total = stats.reduce((sum, item) => sum + item.count, 0)
  const draft = getStat(stats, "DRAFT")
  const submitted = getStat(stats, "SUBMITTED")
  const approved = getStat(stats, "APPROVED")

  return (
    <div className="container-fluid">
      <div
        className="card border-0 shadow-sm mb-6"
        style={{
          background:
            "linear-gradient(90deg, #2754d7 0%, #0f214f 55%, #091531 100%)",
        }}
      >
        <div className="card-body p-6 p-lg-7">
          <div className="d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-5">
            <div className="flex-grow-1">
              <h1 className="text-white fw-bolder mb-3">
                Dashboard Peremajaan
              </h1>

              <div className="text-white opacity-75 fs-5 fw-semibold mb-5">
                Pantau usulan koreksi data ASN, status workflow, dan aktivitas
                terbaru layanan.
              </div>

              <div
                className="rounded-4 border p-4"
                style={{
                  background: "rgba(7, 19, 53, 0.28)",
                  borderColor: "rgba(255,255,255,0.16)",
                }}
              >
                <div className="text-white fw-bold fs-5 mb-3">
                  Area ini dipakai untuk menjaga alur perubahan data ASN tetap
                  terkontrol dan terdokumentasi.
                </div>

                <div className="d-flex flex-wrap gap-3">
                  <StatBadge
                    label="Total Usulan"
                    value={total}
                    className="badge-light-primary text-primary"
                  />
                  <StatBadge
                    label="Draft"
                    value={draft}
                    className="badge-light-warning text-warning"
                  />
                  <StatBadge
                    label="Disetujui"
                    value={approved}
                    className="badge-light-success text-success"
                  />
                </div>
              </div>
            </div>

            <div className="d-flex flex-column flex-sm-row flex-xl-column gap-3">
              <Link
                to="/layanan/peremajaan/list"
                className="btn btn-light-primary"
              >
                Lihat Daftar
              </Link>
              <Link
                to="/layanan/peremajaan/create"
                className="btn btn-primary"
              >
                Buat Usulan
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header align-items-center border-0 pt-6">
          <div className="card-title">
            <div className="d-flex flex-column">
              <span className="fs-2 fw-bolder text-gray-900">
                Ringkasan Peremajaan Data
              </span>
              <span className="text-muted fs-7">
                Gunakan daftar dan detail layanan untuk meninjau dokumen,
                checklist, dan timeline workflow.
              </span>
            </div>
          </div>

          <div className="card-toolbar d-flex gap-3">
            <Link
              to="/layanan/peremajaan/list"
              className="btn btn-sm btn-light-primary"
            >
              Buka Daftar
            </Link>
          </div>
        </div>

        <div className="card-body pt-2 pb-8">
          {loading ? (
            <div className="text-center text-muted py-10">
              Memuat dashboard...
            </div>
          ) : error ? (
            <div className="alert alert-danger mb-0">
              Gagal memuat dashboard peremajaan
            </div>
          ) : (
            <div className="row g-6">
              <div className="col-12 col-xl-8">
                <div className="row g-5 mb-6">
                  <div className="col-12 col-md-4">
                    <div className="rounded border border-gray-300 border-dashed bg-light p-5 h-100">
                      <div className="text-muted fs-7 mb-1">Total Usulan</div>
                      <div className="fw-bolder text-gray-900 fs-2">{total}</div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="rounded border border-gray-300 border-dashed bg-light p-5 h-100">
                      <div className="text-muted fs-7 mb-1">Menunggu Proses</div>
                      <div className="fw-bolder text-gray-900 fs-2">
                        {draft + submitted}
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="rounded border border-gray-300 border-dashed bg-light p-5 h-100">
                      <div className="text-muted fs-7 mb-1">Disetujui</div>
                      <div className="fw-bolder text-gray-900 fs-2">
                        {approved}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-muted fs-7">
                  Perubahan data baru diterapkan ke profil pegawai setelah
                  usulan melewati workflow approval.
                </div>
              </div>

              <div className="col-12 col-xl-4">
                <div className="rounded border border-gray-300 border-dashed bg-light p-6 h-100">
                  <div className="fw-bolder text-gray-900 mb-4">
                    Aktivitas Terbaru
                  </div>

                  {recent.length === 0 ? (
                    <div className="text-muted fs-7">
                      Tidak ada data terbaru
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-4">
                      {recent.slice(0, 4).map((item) => (
                        <Link
                          key={item.id}
                          to={`/layanan/peremajaan/${item.id}`}
                          className="text-gray-800 text-hover-primary"
                        >
                          <div className="fw-semibold">
                            {item.pemohon || item.nomor}
                          </div>
                          <div className="text-muted fs-8">
                            {item.status} - {item.createdAt}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
