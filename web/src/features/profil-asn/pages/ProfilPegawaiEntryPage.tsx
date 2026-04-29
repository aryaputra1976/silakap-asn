// web/src/features/profil-asn/pages/ProfilPegawaiEntryPage.tsx
import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"

function buildDaftarPegawaiPath(keyword: string): string {
  const trimmedKeyword = keyword.trim()

  if (!trimmedKeyword) {
    return "/data-asn/pegawai"
  }

  const params = new URLSearchParams({
    search: trimmedKeyword,
  })

  return `/data-asn/pegawai?${params.toString()}`
}

function HeaderBadge({
  label,
  className,
}: {
  label: string
  className: string
}) {
  return (
    <span className={`badge fw-bold fs-8 px-4 py-2 ${className}`}>{label}</span>
  )
}

export default function ProfilPegawaiEntryPage() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState("")

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate(buildDaftarPegawaiPath(keyword))
  }

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
              <h1 className="text-white fw-bolder mb-3">Profil Pegawai</h1>

              <div className="text-white opacity-75 fs-5 fw-semibold mb-5">
                Cari ASN dan arahkan pencarian ke Daftar Pegawai sebelum membuka
                detail profil.
              </div>

              <div
                className="rounded-4 border p-4"
                style={{
                  background: "rgba(7, 19, 53, 0.28)",
                  borderColor: "rgba(255,255,255,0.16)",
                }}
              >
                <div className="text-white fw-bold fs-5 mb-3">
                  Area ini dipakai untuk menjaga alur pencarian profil ASN tetap
                  konsisten.
                </div>

                <div className="d-flex flex-wrap gap-3">
                  <HeaderBadge
                    label="Entry Profil"
                    className="badge-light-primary text-primary"
                  />
                  <HeaderBadge
                    label="Daftar Pegawai"
                    className="badge-light-success text-success"
                  />
                  <HeaderBadge
                    label="Riwayat & Kelengkapan"
                    className="badge-light-warning text-warning"
                  />
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-center justify-content-xl-end">
              <div
                className="symbol symbol-80px symbol-lg-90px"
                style={{ minWidth: 96 }}
              >
                <span
                  className="symbol-label"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    borderRadius: "50%",
                  }}
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

      <div className="card shadow-sm border-0">
        <div className="card-header align-items-center border-0 pt-6">
          <div className="card-title">
            <div className="d-flex flex-column">
              <span className="fs-2 fw-bolder text-gray-900">
                Pencarian Profil ASN
              </span>
              <span className="text-muted fs-7">
                Masukkan nama, NIP, jabatan, atau unit kerja.
              </span>
            </div>
          </div>

          <div className="card-toolbar">
            <Link to="/data-asn/pegawai" className="btn btn-sm btn-light-primary">
              Buka Daftar Pegawai
            </Link>
          </div>
        </div>

        <div className="card-body pt-2 pb-8">
          <form onSubmit={handleSubmit}>
            <div className="row g-6">
              <div className="col-12 col-xl-8">
                <label className="form-label fw-bold text-gray-700 fs-6">
                  Kata Kunci Pencarian
                </label>

                <div className="position-relative mb-3">
                  <i className="ki-duotone ki-magnifier fs-2 text-gray-500 position-absolute top-50 translate-middle-y ms-5">
                    <span className="path1" />
                    <span className="path2" />
                  </i>

                  <input
                    type="text"
                    className="form-control form-control-lg form-control-solid ps-13"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="Contoh: Arya Putra / 1987 / BKPSDM / Analis"
                  />
                </div>

                <div className="text-muted fs-7 mb-5">
                  Pencarian akan diarahkan ke halaman Daftar Pegawai agar hasil,
                  filter, dan navigasi detail tetap konsisten.
                </div>

                <div className="d-flex flex-wrap gap-3">
                  <button type="submit" className="btn btn-primary">
                    Cari di Daftar Pegawai
                  </button>

                  <Link
                    to="/data-asn/pegawai"
                    className="btn btn-light-primary"
                  >
                    Lihat Semua Pegawai
                  </Link>
                </div>
              </div>

              <div className="col-12 col-xl-4">
                <div className="rounded border border-gray-300 border-dashed bg-light p-6 h-100">
                  <div className="fw-bolder text-gray-900 mb-4">
                    Catatan Penggunaan
                  </div>

                  <div className="text-gray-700 fs-7 mb-3">
                    1. Cari ASN berdasarkan nama, NIP, jabatan, atau unit kerja.
                  </div>
                  <div className="text-gray-700 fs-7 mb-3">
                    2. Periksa hasilnya di Daftar Pegawai.
                  </div>
                  <div className="text-gray-700 fs-7">
                    3. Buka tombol Detail untuk melihat profil ASN.
                  </div>
                </div>
              </div>
            </div>
          </form>

          <div className="separator separator-dashed my-8" />

          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
            <div>
              <div className="fw-bold text-gray-900 mb-1">Akses Modul Terkait</div>
              <div className="text-muted fs-7">
                Gunakan modul pendukung bila perlu meninjau riwayat atau
                kelengkapan data ASN.
              </div>
            </div>

            <div className="d-flex flex-wrap gap-3">
              <Link
                to="/data-asn/riwayat"
                className="btn btn-sm btn-light-warning"
              >
                Riwayat ASN
              </Link>

              <Link
                to="/data-asn/kelengkapan"
                className="btn btn-sm btn-light-success"
              >
                Kelengkapan Data
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}