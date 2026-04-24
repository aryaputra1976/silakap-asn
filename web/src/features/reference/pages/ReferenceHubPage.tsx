import { Link } from "react-router-dom"
import { KTIcon } from "@/_metronic/helpers"

type ReferenceLink = {
  title: string
  description: string
  path: string
  tag?: string
}

type ReferenceSection = {
  title: string
  description: string
  accent: string
  summary: string
  links: ReferenceLink[]
}

type GovernanceItem = {
  title: string
  description: string
}

const ASN_SECTIONS: ReferenceSection[] = [
  {
    title: "Identitas Dasar ASN",
    description:
      "Referensi inti yang dipakai di biodata, validasi profil, layanan, dan laporan pegawai.",
    accent: "#1d4ed8",
    summary: "Master dasar untuk identitas personal dan status kepegawaian.",
    links: [
      {
        title: "Jenis Kelamin",
        description: "Dipakai di profil ASN, statistik pegawai, dan laporan.",
        path: "/master/jenis-kelamin",
        tag: "Biodata",
      },
      {
        title: "Status Kepegawaian",
        description: "Mengendalikan klasifikasi pegawai aktif untuk data ASN dan layanan.",
        path: "/master/status-kepegawaian",
        tag: "Status",
      },
      {
        title: "Jenis Pegawai",
        description: "Membedakan kelompok pegawai seperti PNS, PPPK, dan kategori lainnya.",
        path: "/master/jenis-pegawai",
        tag: "Klasifikasi",
      },
      {
        title: "Status Perkawinan",
        description: "Dipakai untuk data keluarga, profil, dan validasi administrasi ASN.",
        path: "/master/status-perkawinan",
        tag: "Keluarga",
      },
      {
        title: "Agama",
        description: "Referensi standar untuk biodata ASN dan konsistensi profil.",
        path: "/master/agama",
        tag: "Biodata",
      },
      {
        title: "Tempat Lahir",
        description: "Master lokasi kelahiran untuk identitas ASN yang rapi dan konsisten.",
        path: "/master/tempat-lahir",
        tag: "Lokasi",
      },
    ],
  },
  {
    title: "Pendidikan dan Karier",
    description:
      "Fondasi referensi untuk riwayat pendidikan, jabatan, golongan, dan struktur karier ASN.",
    accent: "#0f766e",
    summary: "Dipakai langsung oleh profil ASN, layanan, laporan, dan ranking data pegawai.",
    links: [
      {
        title: "Pendidikan",
        description: "Referensi pendidikan formal yang dipakai di profil dan riwayat pendidikan.",
        path: "/master/pendidikan",
        tag: "Pendidikan",
      },
      {
        title: "Tingkat Pendidikan",
        description: "Kelompok tingkat pendidikan untuk klasifikasi dan pelaporan data.",
        path: "/master/pendidikan-tingkat",
        tag: "Klasifikasi",
      },
      {
        title: "Jabatan",
        description: "Master jabatan ASN yang dipakai layanan, profil, dan laporan pegawai.",
        path: "/master/jabatan",
        tag: "Karier",
      },
      {
        title: "Jenis Jabatan",
        description: "Mengelompokkan jabatan ke struktural, fungsional, dan pelaksana.",
        path: "/master/jenis-jabatan",
        tag: "Struktur",
      },
      {
        title: "Golongan",
        description: "Dipakai pada profil, layanan, KGB, pensiun, dan laporan pegawai.",
        path: "/master/golongan",
        tag: "Kepangkatan",
      },
      {
        title: "Kedudukan Hukum",
        description: "Menjaga konsistensi status hukum ASN pada data kepegawaian.",
        path: "/master/kedudukan-hukum",
        tag: "Status",
      },
    ],
  },
]

const ORGANIZATION_SECTIONS: ReferenceSection[] = [
  {
    title: "Struktur Organisasi Inti",
    description:
      "Referensi organisasi untuk scope OPD, unit kerja, penempatan ASN, dan filter lintas modul.",
    accent: "#7c3aed",
    summary: "Menjadi source of truth untuk hirarki organisasi dan scope unit kerja ASN.",
    links: [
      {
        title: "Unor",
        description: "Unit organisasi utama untuk scope dashboard, laporan, dan data ASN.",
        path: "/master/unor",
        tag: "Scope",
      },
      {
        title: "Satker",
        description: "Satuan kerja yang dipakai dalam pemetaan unit dan struktur organisasi.",
        path: "/master/satker",
        tag: "Struktur",
      },
      {
        title: "Instansi",
        description: "Master instansi untuk referensi ASN, integrasi, dan pelaporan lintas unit.",
        path: "/master/instansi",
        tag: "Instansi",
      },
    ],
  },
  {
    title: "Administrasi dan Lokasi Organisasi",
    description:
      "Referensi pendukung untuk lokasi kerja, kebutuhan administratif, dan turunan organisasi.",
    accent: "#9333ea",
    summary: "Menjaga konsistensi metadata organisasi untuk operasional dan pelaporan.",
    links: [
      {
        title: "Lokasi Kerja",
        description: "Dipakai untuk pemetaan lokasi kerja ASN dan konsistensi data organisasi.",
        path: "/master/lokasi-kerja",
        tag: "Lokasi",
      },
      {
        title: "KPKN",
        description: "Referensi administratif untuk kebutuhan kepegawaian tertentu.",
        path: "/master/kpkn",
        tag: "Administrasi",
      },
    ],
  },
]

const DOCUMENT_SECTIONS: ReferenceSection[] = [
  {
    title: "Taksonomi Layanan",
    description:
      "Master referensi yang menopang klasifikasi layanan aktif dan konsistensi service code.",
    accent: "#b45309",
    summary: "Berperan langsung pada create layanan, workflow, dan routing layanan aktif.",
    links: [
      {
        title: "Jenis Layanan",
        description: "Source of truth service code dan klasifikasi layanan aktif aplikasi.",
        path: "/master/jenis-layanan",
        tag: "Workflow",
      },
    ],
  },
  {
    title: "Domain Pensiun dan Dokumen Administratif",
    description:
      "Referensi domain yang dipakai untuk normalisasi payload, validasi usulan, dan kelengkapan administratif pensiun.",
    accent: "#d97706",
    summary: "Saat ini paling relevan untuk blueprint layanan aktif pensiun.",
    links: [
      {
        title: "Jenis Pensiun",
        description: "Dipakai untuk normalisasi domain pensiun saat create dan submit.",
        path: "/master/jenis-pensiun",
        tag: "Pensiun",
      },
      {
        title: "Alasan Pensiun",
        description: "Menopang kelengkapan data domain pensiun dan kebutuhan administratif.",
        path: "/master/alasan-pensiun",
        tag: "Pensiun",
      },
    ],
  },
]

function ReferenceLinkCard({
  link,
  accent,
}: {
  link: ReferenceLink
  accent: string
}) {
  return (
    <Link
      to={link.path}
      className="text-decoration-none"
      style={{ color: "inherit" }}
    >
      <div
        className="rounded-4 border border-gray-200 bg-white p-5 h-100 transition-all"
        style={{
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
        }}
      >
        <div className="d-flex align-items-start justify-content-between gap-4 mb-4">
          <div>
            <div className="fw-bolder fs-3 text-gray-900 mb-2">{link.title}</div>
            <div className="text-gray-600 fs-6 lh-lg">{link.description}</div>
          </div>

          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
            style={{
              width: 44,
              height: 44,
              background: `${accent}14`,
              color: accent,
            }}
          >
            <KTIcon iconName="arrow-right" className="fs-2" />
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-between gap-3">
          <span
            className="badge badge-light fw-semibold"
            style={{
              color: accent,
              backgroundColor: `${accent}14`,
            }}
          >
            {link.tag ?? "Referensi"}
          </span>
          <span className="text-gray-500 fs-8 fw-semibold">
            Buka Master
          </span>
        </div>
      </div>
    </Link>
  )
}

function ReferenceSectionCard({ section }: { section: ReferenceSection }) {
  return (
    <section className="card border-0 shadow-sm h-100 overflow-hidden">
      <div
        className="px-6 px-lg-8 py-6"
        style={{
          background: `linear-gradient(135deg, ${section.accent} 0%, #0f172a 100%)`,
        }}
      >
        <div className="d-flex align-items-center justify-content-between gap-4 mb-4">
          <div>
            <div className="text-white fw-bolder fs-2 mb-2">{section.title}</div>
            <div className="text-white opacity-75 fs-6 lh-lg">
              {section.description}
            </div>
          </div>

          <div
            className="rounded-circle d-none d-lg-inline-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: 58,
              height: 58,
              background: "rgba(255,255,255,0.12)",
              color: "#ffffff",
            }}
          >
            <KTIcon iconName="element-11" className="fs-1" />
          </div>
        </div>

        <div className="rounded-4 px-4 py-3 text-white fs-7 fw-semibold border border-white border-opacity-25">
          {section.summary}
        </div>
      </div>

      <div className="card-body p-6 p-lg-8">
        <div className="row g-5">
          {section.links.map((link) => (
            <div className="col-12" key={link.path}>
              <ReferenceLinkCard link={link} accent={section.accent} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ReferenceHubLayout({
  title,
  description,
  sections,
}: {
  title: string
  description: string
  sections: ReferenceSection[]
}) {
  return (
    <div className="container-fluid">
      <section className="card border-0 shadow-sm overflow-hidden mb-8">
        <div
          className="card-body p-8 p-lg-12"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(59,130,246,0.18), transparent 28%), linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
          }}
        >
          <h1 className="fw-bolder text-gray-900 mb-4" style={{ fontSize: "2.4rem" }}>
            {title}
          </h1>
          <div className="text-gray-700 fs-4 lh-lg mb-6">{description}</div>
          <div className="text-gray-600 fs-6 lh-lg">
            Halaman ini menjadi pintu masuk referensi yang menopang data ASN,
            layanan, workflow, dokumen, dan laporan. Fokusnya bukan hanya
            navigasi, tapi memastikan master yang dipakai lintas modul tetap
            konsisten.
          </div>
        </div>
      </section>

      <div className="row g-8">
        {sections.map((section) => (
          <div className="col-12 col-xxl-6" key={section.title}>
            <ReferenceSectionCard section={section} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ReferenceAsnPage() {
  return (
    <ReferenceHubLayout
      title="Referensi ASN"
      description="Pusat referensi untuk identitas, pendidikan, karier, dan status dasar ASN."
      sections={ASN_SECTIONS}
    />
  )
}

export function ReferenceOrganizationPage() {
  return (
    <ReferenceHubLayout
      title="Referensi Organisasi"
      description="Pusat referensi untuk struktur organisasi, unit kerja, dan pemetaan instansi ASN."
      sections={ORGANIZATION_SECTIONS}
    />
  )
}

export function ReferenceDocumentPage() {
  return (
    <ReferenceHubLayout
      title="Referensi Dokumen"
      description="Pusat referensi yang menopang klasifikasi layanan, normalisasi domain, dan validasi dokumen usulan."
      sections={DOCUMENT_SECTIONS}
    />
  )
}
