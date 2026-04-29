// web/src/features/profil-asn/pages/ProfilDetailPage.tsx
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useAsnDetail } from "../hooks/useAsnDetail"
import { AsnHeaderCard } from "../components/AsnHeaderCard"
import { AsnProfileTab } from "../components/AsnProfileTab"

type ProfilDetailLocationState = {
  backTo?: string
}

export default function ProfilDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { data, loading } = useAsnDetail(id)

  const backTo =
    (location.state as ProfilDetailLocationState | null)?.backTo ??
    "/data-asn/pegawai"

  const goBack = () => navigate(backTo)

  const goToRiwayat = () =>
    navigate(`/data-asn/riwayat?pegawai=${id}`)

  if (loading) {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body d-flex align-items-center justify-content-center py-12">
          <div className="spinner-border text-primary me-3" role="status" />
          <span className="text-muted fw-semibold">Memuat data ASN...</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="card shadow-sm border-0">
        <div className="card-body text-center py-12">
          <div className="fs-5 fw-bolder text-gray-900 mb-2">Data ASN tidak ditemukan</div>
          <div className="text-muted fs-7 mb-5">ID pegawai tidak valid atau data belum tersedia.</div>
          <button type="button" className="btn btn-light-primary" onClick={goBack}>
            ← Kembali
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div
        className="card border-0 shadow-sm mb-6"
        style={{
          background: "linear-gradient(90deg, #2754d7 0%, #0f214f 55%, #091531 100%)",
        }}
      >
        <div className="card-body p-6 p-lg-7">
          <div className="d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-5">
            <div className="flex-grow-1">
              <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                <button
                  type="button"
                  className="btn btn-sm btn-light-primary"
                  onClick={goBack}
                >
                  ← Kembali
                </button>
                <div className="text-white opacity-75 fs-7 fw-semibold text-uppercase">
                  Data ASN / Profil Pegawai / Detail
                </div>
              </div>

              <h1 className="text-white fw-bolder mb-2">{data.nama}</h1>

              <div className="text-white opacity-75 fs-5 fw-semibold mb-5">
                {data.nip}
                {data.jabatan ? ` • ${data.jabatan}` : ""}
              </div>

              <div className="d-flex flex-wrap gap-3">
                <span className="badge badge-light-primary fw-bold fs-8 px-4 py-2">
                  {data.statusAsn}
                </span>
                {data.golongan && (
                  <span className="badge badge-light-warning fw-bold fs-8 px-4 py-2">
                    {data.golongan}
                  </span>
                )}
              </div>
            </div>

            <div className="d-flex justify-content-center justify-content-xl-end">
              <div className="symbol symbol-80px symbol-lg-90px" style={{ minWidth: 96 }}>
                <span
                  className="symbol-label"
                  style={{ background: "rgba(255,255,255,0.12)", borderRadius: "50%" }}
                >
                  <i className="ki-duotone ki-profile-user fs-1 text-white">
                    <span className="path1" />
                    <span className="path2" />
                    <span className="path3" />
                  </i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AsnHeaderCard asn={data} />

      {/* Aksi ke Riwayat */}
      <div className="card shadow-sm border-0 mb-6">
        <div className="card-body p-5">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
            <div>
              <div className="fw-bolder text-gray-900 mb-1">Riwayat Kepegawaian</div>
              <div className="text-muted fs-7">
                Lihat riwayat jabatan, pangkat, pendidikan, diklat, dan data keluarga (DPCP) di workspace riwayat.
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary text-nowrap flex-shrink-0"
              onClick={goToRiwayat}
            >
              <i className="ki-duotone ki-document me-2 fs-4">
                <span className="path1" />
                <span className="path2" />
              </i>
              Buka Riwayat Lengkap
            </button>
          </div>
        </div>
      </div>

      <AsnProfileTab asn={data} />
    </div>
  )
}
