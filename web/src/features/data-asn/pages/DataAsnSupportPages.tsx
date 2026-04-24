import { Link } from "react-router-dom"

type HubCard = {
  title: string
  description: string
  path: string
  badge?: string
}

function DataAsnLinkCard({ title, description, path, badge }: HubCard) {
  return (
    <Link
      to={path}
      className="card shadow-sm h-100 text-decoration-none hover-elevate-up"
    >
      <div className="card-body d-flex flex-column gap-3">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div className="fw-bold text-gray-900 fs-4">{title}</div>
          {badge ? <span className="badge badge-light-primary">{badge}</span> : null}
        </div>
        <div className="text-gray-600 fs-7">{description}</div>
      </div>
    </Link>
  )
}

export function RiwayatAsnPage() {
  return (
    <div className="container-fluid">
      <div className="card mb-7">
        <div className="card-body py-10">
          <h1 className="fw-bold text-gray-900 mb-3">Riwayat ASN</h1>
          <div className="text-gray-600 fs-5 mb-6">
            Halaman ini menjadi hub untuk memastikan data riwayat ASN tetap
            konsisten sebagai source of truth bagi layanan, laporan, dan profil pegawai.
          </div>

          <div className="notice d-flex bg-light-info rounded border-info border border-dashed p-6">
            <div className="d-flex flex-column">
              <div className="fw-bold text-info mb-2">Area Riwayat Yang Harus Stabil</div>
              <div className="text-gray-700 fs-7">
                Fokus utama riwayat ASN meliputi riwayat jabatan, pangkat, dan
                pendidikan. Data ini tidak boleh disalin manual oleh modul layanan,
                tetapi harus selalu dirujuk dari source data ASN.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-6 mb-7">
        <div className="col-12 col-xl-4">
          <DataAsnLinkCard
            title="Daftar Pegawai"
            description="Mulai dari daftar pegawai untuk memilih ASN yang akan ditinjau riwayatnya."
            path="/data-asn/pegawai"
            badge="Aktif"
          />
        </div>
        <div className="col-12 col-xl-4">
          <DataAsnLinkCard
            title="Profil Pegawai"
            description="Masuk ke profil ASN untuk memeriksa data utama dan keterhubungan ke riwayat."
            path="/data-asn/profil"
            badge="Aktif"
          />
        </div>
        <div className="col-12 col-xl-4">
          <DataAsnLinkCard
            title="Laporan Jabatan"
            description="Gunakan laporan jabatan untuk memvalidasi konsistensi sebagian data riwayat aktif."
            path="/laporan/pegawai/jabatan"
            badge="Validasi"
          />
        </div>
      </div>

      <div className="row g-6">
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-header border-0 pt-6">
              <h3 className="card-title fw-bold text-gray-900">Checklist Riwayat</h3>
            </div>
            <div className="card-body pt-2 d-flex flex-column gap-4 text-gray-700 fs-7">
              <div>Pastikan jabatan aktif ASN sesuai dengan riwayat jabatan terakhir.</div>
              <div>Pastikan pangkat dan golongan aktif sinkron dengan riwayat pangkat.</div>
              <div>Pastikan pendidikan aktif tidak bertentangan dengan riwayat pendidikan.</div>
              <div>Pastikan perubahan riwayat tidak memutus laporan dan layanan.</div>
              <div>Pastikan source data riwayat tidak diduplikasi oleh modul layanan.</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-header border-0 pt-6">
              <h3 className="card-title fw-bold text-gray-900">Pengingat Integrasi</h3>
            </div>
            <div className="card-body pt-2 d-flex flex-column gap-4 text-gray-700 fs-7">
              <div>Riwayat ASN menjadi fondasi untuk layanan pensiun, jabatan, dan mutasi.</div>
              <div>Data riwayat juga mempengaruhi klasifikasi laporan pegawai dan dashboard.</div>
              <div>Jika ada mismatch, perbaiki source data ASN terlebih dahulu sebelum menyentuh modul lain.</div>
              <div>Import riwayat dari SIASN tidak boleh mengotori data aktif tanpa validasi.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function KelengkapanDataPage() {
  return (
    <div className="container-fluid">
      <div className="card mb-7">
        <div className="card-body py-10">
          <h1 className="fw-bold text-gray-900 mb-3">Kelengkapan Data</h1>
          <div className="text-gray-600 fs-5 mb-6">
            Halaman ini memosisikan kelengkapan data ASN sebagai fondasi sebelum
            layanan, dokumen, dan verifikasi diproses lebih lanjut.
          </div>

          <div className="notice d-flex bg-light-warning rounded border-warning border border-dashed p-6">
            <div className="d-flex flex-column">
              <div className="fw-bold text-warning mb-2">Kenapa Ini Penting</div>
              <div className="text-gray-700 fs-7">
                Data ASN yang tidak lengkap akan memicu error create layanan,
                submit, verifikasi, laporan, dan integrasi. Karena itu kelengkapan
                data harus dianggap sebagai dependency utama, bukan fitur tambahan.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-6 mb-7">
        <div className="col-12 col-xl-4">
          <DataAsnLinkCard
            title="Daftar Pegawai"
            description="Tinjau ASN aktif dan gunakan filter untuk menemukan data yang perlu diperiksa."
            path="/data-asn/pegawai"
            badge="Aktif"
          />
        </div>
        <div className="col-12 col-xl-4">
          <DataAsnLinkCard
            title="Dokumen Pegawai"
            description="Periksa dokumen pendukung ASN yang menjadi dasar kelengkapan administratif."
            path="/dokumen/pegawai"
            badge="Dependensi"
          />
        </div>
        <div className="col-12 col-xl-4">
          <DataAsnLinkCard
            title="Kelengkapan Dokumen"
            description="Lihat area verifikasi dokumen yang mempengaruhi readiness layanan ASN."
            path="/dokumen/kelengkapan"
            badge="Operasional"
          />
        </div>
      </div>

      <div className="row g-6">
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-header border-0 pt-6">
              <h3 className="card-title fw-bold text-gray-900">Checklist Kelengkapan Data ASN</h3>
            </div>
            <div className="card-body pt-2 d-flex flex-column gap-4 text-gray-700 fs-7">
              <div>Identitas dasar ASN lengkap dan konsisten.</div>
              <div>Unit kerja, jabatan, dan status pegawai aktif tersedia.</div>
              <div>Riwayat utama tidak bertentangan dengan data aktif.</div>
              <div>Dokumen pegawai yang penting dapat diakses.</div>
              <div>Layanan yang bergantung pada ASN bisa resolve konteks tanpa asumsi tambahan.</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-header border-0 pt-6">
              <h3 className="card-title fw-bold text-gray-900">Area Dampak</h3>
            </div>
            <div className="card-body pt-2 d-flex flex-column gap-4 text-gray-700 fs-7">
              <div>Create layanan akan gagal jika pegawai tidak bisa di-resolve dengan benar.</div>
              <div>Submit dan verify bisa terganggu jika dokumen dan data aktif tidak sinkron.</div>
              <div>Laporan pegawai dapat salah jika klasifikasi ASN tidak lengkap.</div>
              <div>Integrasi SIASN berisiko memperparah data jika source lokal belum rapi.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

