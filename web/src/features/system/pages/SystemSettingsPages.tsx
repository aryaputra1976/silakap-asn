import { Link } from "react-router-dom"
import { APP_MENU } from "@/app/navigation/menu.config"
import { filterMenuByAccess } from "@/app/navigation/menu.filter"
import { KTIcon } from "@/_metronic/helpers"
import { PageTitle, type PageLink } from "@/_metronic/layout/core"

const ROLE_MATRIX = [
  "ASN",
  "OPERATOR",
  "VERIFIKATOR",
  "PPK",
  "ADMIN_BKPSDM",
  "SUPER_ADMIN",
] as const

type RoleCode = (typeof ROLE_MATRIX)[number]

const SETTINGS_BREADCRUMBS: PageLink[] = [
  { title: "Dashboard", path: "/dashboard", isActive: false },
  { title: "Pengaturan Sistem", path: "#", isActive: false },
]

function flattenTitles(items: ReturnType<typeof filterMenuByAccess>): string[] {
  const titles: string[] = []

  function walk(
    currentItems: ReturnType<typeof filterMenuByAccess>,
    parentTitle?: string,
  ) {
    currentItems.forEach((item) => {
      const label = parentTitle ? `${parentTitle} / ${item.title}` : item.title

      if (item.path) {
        titles.push(label)
      }

      if (item.children?.length) {
        walk(item.children, item.title)
      }
    })
  }

  walk(items)

  return titles
}

function SystemStatCard({
  label,
  value,
  tone = "primary",
}: {
  label: string
  value: string
  tone?: "primary" | "success" | "warning" | "dark"
}) {
  const toneClass = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    dark: "text-gray-900",
  }[tone]

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body py-6">
        <div className="fs-7 text-gray-500 text-uppercase fw-semibold mb-2">
          {label}
        </div>
        <div className={`fs-2hx fw-bolder ${toneClass}`}>{value}</div>
      </div>
    </div>
  )
}

function SettingsLinkCard({
  title,
  description,
  path,
  badge,
}: {
  title: string
  description: string
  path: string
  badge?: string
}) {
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
        <div className="text-gray-600 fs-7 lh-lg">{description}</div>
      </div>
    </Link>
  )
}

function GovernanceCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded border border-gray-300 border-dashed px-5 py-5 h-100 bg-light-primary bg-opacity-10">
      <div className="fw-bold text-gray-900 fs-5 mb-2">{title}</div>
      <div className="text-gray-700 fs-7 lh-lg">{description}</div>
    </div>
  )
}

function WorkflowActionCard({
  step,
  title,
  description,
  note,
}: {
  step: string
  title: string
  description: string
  note: string
}) {
  return (
    <div className="rounded border border-gray-300 border-dashed bg-light-primary bg-opacity-10 px-5 py-5 h-100">
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="w-40px h-40px rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bolder">
          {step}
        </div>
        <div className="fw-bold text-gray-900 fs-4">{title}</div>
      </div>
      <div className="text-gray-700 fs-6 lh-lg mb-3">{description}</div>
      <div className="text-gray-500 fs-7">{note}</div>
    </div>
  )
}

function WorkflowInfoCard({
  label,
  value,
  description,
  tone = "primary",
}: {
  label: string
  value: string
  description: string
  tone?: "primary" | "success" | "warning" | "dark"
}) {
  const toneClass = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    dark: "text-gray-900",
  }[tone]

  return (
    <div className="rounded border border-gray-300 border-dashed bg-white px-5 py-5 h-100">
      <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
        {label}
      </div>
      <div className={`fw-bolder fs-1 mb-2 ${toneClass}`}>{value}</div>
      <div className="text-gray-600 fs-7 lh-lg">{description}</div>
    </div>
  )
}

function WorkflowHubHero() {
  return (
    <div className="card border-0 shadow-sm mb-7 overflow-hidden">
      <div
        className="px-6 px-lg-8 py-6"
        style={{
          background: "linear-gradient(135deg, #1d4ed8 0%, #16224a 52%, #0f172a 100%)",
        }}
      >
        <div className="d-flex align-items-start justify-content-between gap-4 mb-4">
          <div className="flex-grow-1">
            <div className="text-white fw-bolder fs-2 mb-2">Workflow</div>
            <div className="text-white opacity-75 fs-6 lh-lg">
              Kelola antrian verifikasi, pantau status proses, dan pastikan keputusan
              approval atau disposisi berjalan konsisten sampai selesai.
            </div>
          </div>

          <div
            className="rounded-circle d-none d-lg-inline-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: 68,
              height: 68,
              background: "rgba(255,255,255,0.12)",
              color: "#ffffff",
            }}
          >
            <KTIcon iconName="abstract-26" className="fs-1" />
          </div>
        </div>

        <div className="rounded-4 px-4 py-3 text-white border border-white border-opacity-25">
          <div className="fw-semibold fs-6 mb-2">
            Gunakan halaman ini untuk memproses usulan yang menunggu aksi, memantau
            status proses, dan meneruskan pekerjaan bila perlu disposisi.
          </div>
          <div className="d-flex flex-wrap gap-2">
            <span className="badge badge-light-primary">Fokus Antrian Verifikasi</span>
            <span className="badge badge-light-success">4 Layanan Aktif</span>
            <span className="badge badge-light-dark">9 Status Kunci</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoleHubHero() {
  return (
    <div className="card border-0 shadow-sm mb-7 overflow-hidden">
      <div
        className="px-6 px-lg-8 py-6"
        style={{
          background: "linear-gradient(135deg, #1d4ed8 0%, #16224a 52%, #0f172a 100%)",
        }}
      >
        <div className="d-flex align-items-start justify-content-between gap-4 mb-4">
          <div className="flex-grow-1">
            <div className="text-white fw-bolder fs-2 mb-2">Role</div>
            <div className="text-white opacity-75 fs-6 lh-lg">
              Atur dan tinjau hak akses menu, route, dan area kerja yang terlihat untuk
              setiap role di aplikasi.
            </div>
          </div>

          <div
            className="rounded-circle d-none d-lg-inline-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: 68,
              height: 68,
              background: "rgba(255,255,255,0.12)",
              color: "#ffffff",
            }}
          >
            <KTIcon iconName="security-user" className="fs-1" />
          </div>
        </div>

        <div className="rounded-4 px-4 py-3 text-white border border-white border-opacity-25">
          <div className="fw-semibold fs-6 mb-2">
            Gunakan halaman ini untuk memeriksa menu per role, membandingkan route
            yang terbuka, dan menilai dampak perubahan akses sebelum dirilis.
          </div>
          <div className="d-flex flex-wrap gap-2">
            <span className="badge badge-light-primary">Fokus Matriks Akses</span>
            <span className="badge badge-light-success">{ROLE_MATRIX.length} Role Aktif</span>
            <span className="badge badge-light-dark">{APP_MENU.length} Grup Menu</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function WorkflowSettingsPage() {
  return (
    <div className="container-fluid">
      <PageTitle breadcrumbs={SETTINGS_BREADCRUMBS}>Workflow</PageTitle>

      <WorkflowHubHero />

      <div className="row g-6 mb-7">
        <div className="col-12 col-xl-4">
          <Link
            to="/workflow/queue"
            className="card shadow-sm h-100 text-decoration-none border border-primary border-opacity-25 hover-elevate-up"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 102, 255, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
            }}
          >
            <div className="card-body d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-start gap-3">
                <div className="fw-bold text-gray-900 fs-3">Antrian Verifikasi</div>
                <span className="badge badge-primary">Prioritas Utama</span>
              </div>
              <div className="text-gray-700 fs-6 lh-lg">
                Buka daftar usulan yang menunggu pemeriksaan, verifikasi, atau
                keputusan berikutnya.
              </div>
              <div className="rounded border border-primary border-dashed px-4 py-3 bg-white bg-opacity-75">
                <div className="fw-semibold text-primary mb-1">Masuk dari sini terlebih dulu</div>
                <div className="text-gray-600 fs-7">
                  Ini adalah titik kerja utama untuk memproses usulan yang sedang
                  aktif hari ini.
                </div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-12 col-xl-4">
          <SettingsLinkCard
            title="Monitoring Workflow"
            description="Lihat status proses yang sedang berjalan agar bottleneck dan usulan macet cepat terdeteksi."
            path="/workflow/monitoring"
            badge="Langkah 2"
          />
        </div>
        <div className="col-12 col-xl-4">
          <SettingsLinkCard
            title="Disposisi"
            description="Teruskan pekerjaan atau instruksi ke role terkait saat proses perlu distribusi keputusan."
            path="/workflow/disposisi"
            badge="Langkah 3"
          />
        </div>
      </div>

      <div className="row g-6 mb-7">
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-header border-0 pt-6">
              <h3 className="card-title fw-bold text-gray-900">Urutan Kerja yang Disarankan</h3>
            </div>
            <div className="card-body pt-2">
              <div className="row g-4">
                <div className="col-12">
                  <WorkflowActionCard
                    step="1"
                    title="Cek usulan yang menunggu aksi"
                    description="Mulai dari Antrian Verifikasi untuk melihat item yang benar-benar perlu diproses hari ini."
                    note="Fokus pada usulan yang masih menunggu keputusan agar SLA tetap terjaga."
                  />
                </div>
                <div className="col-12">
                  <WorkflowActionCard
                    step="2"
                    title="Pastikan status dan dokumen sudah siap"
                    description="Sebelum approve atau return, cek status aktif, kelengkapan dokumen, dan catatan proses pada detail usulan."
                    note="Langkah ini mencegah keputusan diambil pada usulan yang masih belum lengkap."
                  />
                </div>
                <div className="col-12">
                  <WorkflowActionCard
                    step="3"
                    title="Pantau hasil keputusan"
                    description="Setelah aksi dilakukan, gunakan Monitoring Workflow untuk memastikan usulan berpindah ke status yang benar."
                    note="Jika perlu, gunakan Disposisi untuk meneruskan pekerjaan ke role berikutnya."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-header border-0 pt-6">
              <h3 className="card-title fw-bold text-gray-900">Hal yang Perlu Dicek Sebelum Mengubah Workflow</h3>
            </div>
            <div className="card-body pt-2">
              <div className="d-flex flex-column gap-4">
                <GovernanceCard
                  title="Jangan ubah alur tanpa cek layanan aktif"
                  description="Pastikan perubahan workflow masih cocok dengan proses create, submit, dan detail di menu Layanan ASN."
                />
                <GovernanceCard
                  title="Dokumen wajib harus tetap sinkron"
                  description="Perubahan approval harus tetap sejalan dengan kelengkapan dokumen usulan dan dokumen pegawai."
                />
                <GovernanceCard
                  title="Jejak proses tidak boleh putus"
                  description="Status, log layanan, timeline workflow, dan audit log harus tetap tercatat setiap kali aksi dilakukan."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header border-0 pt-6">
          <h3 className="card-title fw-bold text-gray-900">Modul Terkait</h3>
        </div>
        <div className="card-body pt-2">
          <div className="row g-4">
            <div className="col-12 col-xl-4">
              <SettingsLinkCard
                title="Layanan ASN"
                description="Gunakan menu ini untuk menguji apakah create, submit, dan detail layanan masih berjalan setelah perubahan workflow."
                path="/layanan/pensiun"
                badge="Utama"
              />
            </div>
            <div className="col-12 col-xl-4">
              <SettingsLinkCard
                title="Dokumen & Arsip"
                description="Cek area ini saat approval membutuhkan dokumen wajib atau integrasi DMS sebagai bagian dari proses."
                path="/dokumen/kelengkapan"
                badge="Pendukung"
              />
            </div>
            <div className="col-12 col-xl-4">
              <SettingsLinkCard
                title="Referensi Dokumen"
                description="Buka master referensi jika jenis dokumen, syarat, atau klasifikasi layanan perlu disesuaikan."
                path="/referensi/dokumen"
                badge="Fondasi"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RoleSettingsPage() {
  const roleSummaries = ROLE_MATRIX.map((role) => {
    const filteredMenu = filterMenuByAccess(APP_MENU, {
      roles: [role],
      permissions: [],
    })

    const topLevelTitles = filteredMenu.map((item) => item.title)
    const routeTitles = flattenTitles(filteredMenu)

    return {
      role,
      topLevelTitles,
      routeTitles,
    }
  })

  return (
    <div className="container-fluid">
      <PageTitle breadcrumbs={SETTINGS_BREADCRUMBS}>Role</PageTitle>

      <RoleHubHero />

      <div className="row g-6 mb-7">
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-header border-0 pt-6">
              <h3 className="card-title fw-bold text-gray-900">Hal yang Perlu Dijaga</h3>
            </div>
            <div className="card-body pt-2">
              <div className="row g-4">
                <div className="col-12">
                  <GovernanceCard
                    title="Gunakan session aktif sebagai acuan"
                    description="Role dan permission harus dibaca dari auth yang aktif, bukan dari tebakan UI atau cache lokal."
                  />
                </div>
                <div className="col-12">
                  <GovernanceCard
                    title="Pastikan SUPER_ADMIN bisa melihat struktur penuh"
                    description="SUPER_ADMIN harus tetap bisa meninjau keseluruhan struktur menu yang tersedia di runtime."
                  />
                </div>
                <div className="col-12">
                  <GovernanceCard
                    title="Akses UI tidak boleh menabrak rule proses"
                    description="Walau menu terlihat, aksi submit, approve, atau reject tetap harus tunduk pada guard dan rule backend."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card shadow-sm h-100">
            <div className="card-header border-0 pt-6">
              <h3 className="card-title fw-bold text-gray-900">Menu Admin yang Paling Sering Dipakai</h3>
            </div>
            <div className="card-body pt-2 d-flex flex-column gap-3">
              <SettingsLinkCard
                title="Pengguna"
                description="Kelola registrasi operator, akun aktif, dan review user yang menunggu persetujuan."
                path="/pengaturan/pengguna"
                badge="Utama"
              />
              <SettingsLinkCard
                title="Audit Log"
                description="Tinjau jejak perubahan penting saat mengecek aktivitas user dan perubahan sistem."
                path="/keamanan/audit-log"
                badge="Pendukung"
              />
              <SettingsLinkCard
                title="Workflow"
                description="Cek jalur operasional workflow aktif jika perubahan role berkaitan dengan proses verifikasi."
                path="/pengaturan/workflow"
                badge="Terkait"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header border-0 pt-6">
          <h3 className="card-title fw-bold text-gray-900">Matriks Role dan Route</h3>
        </div>
        <div className="card-body pt-2">
          <div className="text-gray-600 fs-6 mb-6">
            Gunakan matriks ini untuk membandingkan menu yang terlihat dan
            route yang terbuka pada masing-masing role sebelum perubahan akses
            dirilis.
          </div>
          <div className="row g-6">
        {roleSummaries.map((summary) => (
          <div className="col-12 col-xxl-6" key={summary.role}>
            <div className="card shadow-sm h-100">
              <div className="card-header border-0 pt-6 d-flex justify-content-between align-items-center">
                <h3 className="card-title fw-bold text-gray-900 mb-0">{summary.role}</h3>
                <span className="badge badge-light-primary">
                  {summary.routeTitles.length} route aktif
                </span>
              </div>

              <div className="card-body pt-2">
                <div className="mb-5">
                  <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
                    Grup Menu
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {summary.topLevelTitles.map((title) => (
                      <span className="badge badge-light-dark" key={title}>
                        {title}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-gray-500 fs-8 fw-semibold text-uppercase mb-2">
                    Route Terlihat
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {summary.routeTitles.map((title) => (
                      <div
                        key={title}
                        className="rounded border border-gray-300 border-dashed px-4 py-3 fs-7 text-gray-700"
                      >
                        {title}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
          </div>
        </div>
      </div>
    </div>
  )
}
