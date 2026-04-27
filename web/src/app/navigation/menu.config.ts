// web/src/app/navigation/menu.config.ts

const ALL_ROLES = [
  "ASN",
  "OPERATOR",
  "VERIFIKATOR",
  "PPK",
  "ADMIN_BKPSDM",
  "SUPER_ADMIN"
]

const INTERNAL_ROLES = [
  "OPERATOR",
  "VERIFIKATOR",
  "PPK",
  "ADMIN_BKPSDM",
  "SUPER_ADMIN"
]

const SERVICE_ROLES = ALL_ROLES
const WORKFLOW_ROLES = ["VERIFIKATOR", "PPK", "ADMIN_BKPSDM", "SUPER_ADMIN"]
const DMS_ROLES = ["OPERATOR", "VERIFIKATOR", "PPK", "ADMIN_BKPSDM", "SUPER_ADMIN"]
const ADMIN_ROLES = ["ADMIN_BKPSDM", "SUPER_ADMIN"]
const SECURITY_ROLES = ["ADMIN_BKPSDM", "SUPER_ADMIN"]

export type AppMenuItem = {
  key: string
  title: string
  path?: string
  icon?: string
  permission?: string
  permissionAny?: string[]
  rolesAny?: string[]
  badgeKey?: string
  children?: AppMenuItem[]
}

export type MenuItemConfig = AppMenuItem

export const APP_MENU: AppMenuItem[] = [
  {
    key: "dashboard",
    title: "Dashboard",
    path: "/dashboard",
    icon: "element-11",
    rolesAny: ALL_ROLES
  },
  {
    key: "layanan-asn",
    title: "Layanan ASN",
    icon: "briefcase",
    rolesAny: SERVICE_ROLES,
    children: [
      {
        key: "layanan-pensiun",
        title: "Pensiun",
        path: "/layanan/pensiun",
        rolesAny: SERVICE_ROLES
      },
      {
        key: "layanan-mutasi",
        title: "Mutasi",
        path: "/layanan/mutasi",
        rolesAny: SERVICE_ROLES
      },
      {
        key: "layanan-kgb",
        title: "KGB",
        path: "/layanan/kgb",
        rolesAny: SERVICE_ROLES
      },
      {
        key: "layanan-jabatan",
        title: "Jabatan",
        path: "/layanan/jabatan",
        rolesAny: SERVICE_ROLES
      },
      {
        key: "layanan-peremajaan",
        title: "Peremajaan Data",
        path: "/layanan/peremajaan",
        rolesAny: ["OPERATOR", "ADMIN_BKPSDM", "SUPER_ADMIN"]
      },
      {
        key: "layanan-draft",
        title: "Draft Saya",
        path: "/layanan/draft",
        rolesAny: ["ASN", "OPERATOR", "ADMIN_BKPSDM", "SUPER_ADMIN"]
      },
      {
        key: "layanan-status",
        title: "Status Layanan",
        path: "/layanan/status",
        rolesAny: SERVICE_ROLES
      }
    ]
  },
  {
    key: "workflow",
    title: "Verifikasi & Persetujuan",
    icon: "check-circle",
    rolesAny: WORKFLOW_ROLES,
    badgeKey: "workflow.queue",
    children: [
      {
        key: "workflow-queue",
        title: "Antrian Verifikasi",
        path: "/workflow/queue",
        rolesAny: WORKFLOW_ROLES,
        badgeKey: "workflow.queue"
      },
      {
        key: "workflow-approval",
        title: "Disposisi",
        path: "/workflow/disposisi",
        rolesAny: ["PPK", "ADMIN_BKPSDM", "SUPER_ADMIN"]
      },
      {
        key: "workflow-timeline",
        title: "Monitoring Workflow",
        path: "/workflow/monitoring",
        rolesAny: WORKFLOW_ROLES
      }
    ]
  },
  {
    key: "dokumen",
    title: "Dokumen & Arsip",
    icon: "file",
    rolesAny: DMS_ROLES,
    children: [
      {
        key: "dokumen-usulan",
        title: "Dokumen Usulan",
        path: "/dokumen/usulan",
        rolesAny: DMS_ROLES
      },
      {
        key: "dokumen-kelengkapan",
        title: "Kelengkapan Dokumen",
        path: "/dokumen/kelengkapan",
        rolesAny: ["VERIFIKATOR", "PPK", "ADMIN_BKPSDM", "SUPER_ADMIN"],
        badgeKey: "dokumen.incomplete"
      },
      {
        key: "dokumen-pegawai",
        title: "Dokumen Pegawai",
        path: "/dokumen/pegawai",
        rolesAny: DMS_ROLES
      },
      {
        key: "dokumen-dms",
        title: "Arsip DMS",
        path: "/dms-monitoring",
        rolesAny: DMS_ROLES
      }
    ]
  },
  {
    key: "data-asn",
    title: "Data ASN",
    icon: "profile-user",
    rolesAny: INTERNAL_ROLES,
    children: [
      {
        key: "pegawai-profile",
        title: "Profil Pegawai",
        path: "/data-asn/profil",
        rolesAny: INTERNAL_ROLES
      },
      {
        key: "pegawai-list",
        title: "Daftar Pegawai",
        path: "/data-asn/pegawai",
        rolesAny: INTERNAL_ROLES
      },
      {
        key: "pegawai-riwayat",
        title: "Riwayat ASN",
        path: "/data-asn/riwayat",
        rolesAny: INTERNAL_ROLES
      },
      {
        key: "pegawai-kelengkapan",
        title: "Kelengkapan Data",
        path: "/data-asn/kelengkapan",
        rolesAny: INTERNAL_ROLES
      }
    ]
  },
  {
    key: "laporan",
    title: "Laporan",
    icon: "chart-simple-3",
    rolesAny: INTERNAL_ROLES,
    children: [
      {
        key: "laporan-pegawai-gender",
        title: "Jenis Kelamin",
        path: "/laporan/pegawai/jenis-kelamin",
        rolesAny: INTERNAL_ROLES
      },
      {
        key: "laporan-pegawai-pendidikan",
        title: "Pendidikan",
        path: "/laporan/pegawai/pendidikan",
        rolesAny: INTERNAL_ROLES
      },
      {
        key: "laporan-pegawai-golongan",
        title: "Golongan",
        path: "/laporan/pegawai/golongan",
        rolesAny: INTERNAL_ROLES
      },
      {
        key: "laporan-pegawai-jabatan",
        title: "Jabatan",
        path: "/laporan/pegawai/jabatan",
        rolesAny: INTERNAL_ROLES
      }
    ]
  },
  {
    key: "system",
    title: "Pengaturan Sistem",
    icon: "setting-2",
    rolesAny: ADMIN_ROLES,
    children: [
      {
        key: "system-workflow",
        title: "Workflow",
        path: "/pengaturan/workflow",
        rolesAny: ADMIN_ROLES
      },
      {
        key: "system-users",
        title: "Pengguna",
        path: "/pengaturan/pengguna",
        rolesAny: ADMIN_ROLES
      },
      {
        key: "system-roles",
        title: "Role",
        path: "/pengaturan/role",
        rolesAny: ADMIN_ROLES
      }
    ]
  },
  {
    key: "reference",
    title: "Master Referensi",
    icon: "database",
    rolesAny: ADMIN_ROLES,
    children: [
      {
        key: "reference-asn",
        title: "Referensi ASN",
        path: "/referensi/asn",
        rolesAny: ADMIN_ROLES
      },
      {
        key: "reference-org",
        title: "Referensi Organisasi",
        path: "/referensi/organisasi",
        rolesAny: ADMIN_ROLES
      },
      {
        key: "reference-document",
        title: "Referensi Dokumen",
        path: "/referensi/dokumen",
        rolesAny: ADMIN_ROLES
      }
    ]
  },
  {
    key: "security",
    title: "Keamanan & Audit",
    icon: "shield",
    rolesAny: SECURITY_ROLES,
    children: [
      {
        key: "security-audit",
        title: "Audit Log",
        path: "/keamanan/audit-log",
        rolesAny: SECURITY_ROLES
      },
      {
        key: "security-activity",
        title: "Aktivitas Pengguna",
        path: "/keamanan/activity",
        rolesAny: SECURITY_ROLES
      }
    ]
  },
  {
    key: "integrasi",
    title: "Integrasi Eksternal",
    icon: "arrows-loop",
    rolesAny: ADMIN_ROLES,
    badgeKey: "integrasi.failed",
    children: [
      {
        key: "integrasi-siasn",
        title: "Sinkronisasi SIASN",
        path: "/integrasi/siasn",
        rolesAny: ADMIN_ROLES
      },
      {
        key: "integrasi-jobs",
        title: "Job Sinkronisasi",
        path: "/integrasi/jobs",
        rolesAny: ADMIN_ROLES
      },
      {
        key: "integrasi-log",
        title: "Riwayat Sinkronisasi",
        path: "/integrasi/log",
        rolesAny: ADMIN_ROLES
      },
      {
        key: "integrasi-import",
        title: "Import Data",
        path: "/integrasi/import",
        rolesAny: ADMIN_ROLES
      },
      {
        key: "integrasi-import-referensi",
        title: "Import Referensi",
        path: "/integrasi/import-referensi",
        rolesAny: ADMIN_ROLES
      }      
    ]
  },
  {
    key: "analytics",
    title: "Analitik SDM",
    icon: "chart-line",
    rolesAny: ADMIN_ROLES,
    children: [
      {
        key: "analytics-overview",
        title: "Dashboard SDM",
        path: "/analitik",
        rolesAny: ADMIN_ROLES
      },
      {
        key: "analytics-formasi",
        title: "Formasi & Kebutuhan",
        path: "/analitik/formasi",
        rolesAny: ADMIN_ROLES
      },
      {
        key: "analytics-abk",
        title: "Analisis Beban Kerja",
        path: "/analitik/abk",
        rolesAny: ADMIN_ROLES
      },
      {
        key: "analytics-talent",
        title: "Talent Pool",
        path: "/analitik/talent",
        rolesAny: ADMIN_ROLES
      }
    ]
  }
]

export const menuConfig = APP_MENU

export default APP_MENU
