import type { Permission } from "@/core/rbac/permissions"
import { PERMISSIONS } from "@/core/rbac/permissions"

export interface MenuItemConfig {
  title: string
  path?: string
  icon?: string
  permission?: Permission
  children?: MenuItemConfig[]
}

/* =====================================================
 * MENU CONFIG — SOURCE OF TRUTH NAVIGATION
 * ===================================================== *
 *
 * Aturan final:
 * - Parent container tanpa path tidak memakai permission langsung.
 * - Permission diletakkan di leaf/child agar filter menu tidak
 *   memblok parent ketika minimal satu child valid.
 * - Parent hanya tampil jika renderer/filter menemukan minimal
 *   satu child yang lolos permission.
 * ===================================================== */

export const menuConfig: MenuItemConfig[] = [
  /* =====================================================
   * DASHBOARD
   * ===================================================== */

  {
    title: "Dashboard",
    icon: "element-11",
    children: [
      {
        title: "Executive Overview",
        path: "/dashboard",
      },
    ],
  },

  /* =====================================================
   * DATA ASN
   * ===================================================== */

  {
    title: "Data ASN",
    path: "/asn/profil",
    icon: "profile-user",
    permission: PERMISSIONS.ASN_READ,
  },

  /* =====================================================
   * WORKFORCE ANALYTICS
   * ===================================================== */

  {
    title: "Workforce Analytics",
    icon: "chart-simple",
    children: [
      {
        title: "Ringkasan ASN",
        path: "/analytics/asn-summary",
        permission: PERMISSIONS.ASN_READ,
      },
      {
        title: "Distribusi ASN",
        path: "/analytics/distribution",
        permission: PERMISSIONS.ASN_READ,
      },
      {
        title: "Statistik OPD",
        path: "/analytics/opd",
        permission: PERMISSIONS.ASN_READ,
      },
      {
        title: "Prediksi Pensiun",
        path: "/analytics/retirement",
        permission: PERMISSIONS.ASN_READ,
      },
      {
        title: "Dashboard Workforce",
        path: "/statistics/workforce",
        permission: PERMISSIONS.ASN_READ,
      },
      {
        title: "Analisis Gap OPD",
        path: "/statistics/workforce/opd",
        permission: PERMISSIONS.ASN_READ,
      },
    ],
  },

  /* =====================================================
   * LAYANAN KEPEGAWAIAN
   * ===================================================== */

  {
    title: "Layanan Kepegawaian",
    icon: "briefcase",
    children: [
      {
        title: "Usul Peremajaan Data",
        path: "/layanan/peremajaan-data",
        permission: PERMISSIONS.SERVICE_CREATE,
      },
      {
        title: "Usul Pensiun",
        path: "/layanan/pensiun",
        permission: PERMISSIONS.SERVICE_CREATE,
      },
      {
        title: "Usul KGB",
        path: "/layanan/kgb",
        permission: PERMISSIONS.SERVICE_CREATE,
      },
      {
        title: "Usul Mutasi",
        path: "/layanan/mutasi",
        permission: PERMISSIONS.SERVICE_CREATE,
      },
      {
        title: "Usul Tugas Belajar",
        path: "/layanan/tugas-belajar",
        permission: PERMISSIONS.SERVICE_CREATE,
      },
      {
        title: "Usul Perpindahan Jabatan",
        path: "/layanan/perpindahan-jabatan",
        permission: PERMISSIONS.SERVICE_CREATE,
      },
      {
        title: "Usul Kenaikan Jabatan",
        path: "/layanan/kenaikan-jabatan",
        permission: PERMISSIONS.SERVICE_CREATE,
      },
      {
        title: "Usul Bebas Hukdis",
        path: "/layanan/bebas-hukdis",
        permission: PERMISSIONS.SERVICE_CREATE,
      },
    ],
  },

  /* =====================================================
   * WORKFLOW
   * ===================================================== */

  {
    title: "Proses & Persetujuan",
    icon: "abstract-26",
    children: [
      {
        title: "Antrian Verifikasi",
        path: "/workflow/antrian",
        permission: PERMISSIONS.SERVICE_VERIFY,
      },
      {
        title: "Disposisi",
        path: "/workflow/disposisi",
        permission: PERMISSIONS.SERVICE_VERIFY,
      },
      {
        title: "Monitoring Proses",
        path: "/workflow/monitoring",
        permission: PERMISSIONS.SERVICE_VIEW_ALL,
      },
    ],
  },

  /* =====================================================
   * DOKUMEN
   * ===================================================== */

  {
    title: "Dokumen & Arsip",
    path: "/dokumen",
    icon: "file",
    permission: PERMISSIONS.DOC_READ,
  },

  /* =====================================================
   * INTEGRASI SIASN
   * ===================================================== */

  {
    title: "Integrasi SIASN",
    icon: "arrows-loop",
    children: [
      {
        title: "Import Data ASN",
        path: "/integrasi/import-asn",
        permission: PERMISSIONS.SIASN_SYNC_VIEW,
      },
      {
        title: "Import Referensi Jabatan",
        path: "/integrasi/import-jabatan",
        permission: PERMISSIONS.SIASN_SYNC_VIEW,
      },
      {
        title: "Import Referensi UNOR",
        path: "/integrasi/import-unor",
        permission: PERMISSIONS.SIASN_SYNC_VIEW,
      },
      {
        title: "Log Import",
        path: "/integrasi/log",
        permission: PERMISSIONS.SIASN_SYNC_VIEW,
      },
      {
        title: "DMS Monitoring",
        path: "/dms-monitoring",
        permission: PERMISSIONS.SIASN_SYNC_VIEW,
      },
    ],
  },

  /* =====================================================
   * KEAMANAN
   * ===================================================== */

  {
    title: "Keamanan & Audit",
    icon: "shield-tick",
    children: [
      {
        title: "Manajemen Pengguna",
        path: "/security/users",
        permission: PERMISSIONS.SECURITY_USER_READ,
      },
      {
        title: "Role & Hak Akses",
        path: "/security/roles",
        permission: PERMISSIONS.SECURITY_ROLE_READ,
      },
      {
        title: "Audit Log",
        path: "/security/audit",
        permission: PERMISSIONS.SECURITY_AUDIT_READ,
      },
    ],
  },

  /* =====================================================
   * MASTER REFERENSI
   * ===================================================== */

  {
    title: "Master Referensi",
    icon: "setting-2",
    children: [
      {
        title: "Agama",
        path: "/master/agama",
        permission: PERMISSIONS.MASTER_AGAMA_VIEW,
      },
      {
        title: "Golongan",
        path: "/master/golongan",
        permission: PERMISSIONS.MASTER_GOLONGAN_VIEW,
      },
      {
        title: "Jenis Jabatan",
        path: "/master/jenis-jabatan",
        permission: PERMISSIONS.MASTER_JENIS_JABATAN_VIEW,
      },
      {
        title: "Jenis Kelamin",
        path: "/master/jenis-kelamin",
        permission: PERMISSIONS.MASTER_JENIS_KELAMIN_VIEW,
      },
      {
        title: "Jenis Pegawai",
        path: "/master/jenis-pegawai",
        permission: PERMISSIONS.MASTER_JENIS_PEGAWAI_VIEW,
      },
      {
        title: "Status Kepegawaian",
        path: "/master/status-kepegawaian",
        permission: PERMISSIONS.MASTER_STATUS_KEPEGAWAIAN_VIEW,
      },
      {
        title: "Status Perkawinan",
        path: "/master/status-perkawinan",
        permission: PERMISSIONS.MASTER_STATUS_PERKAWINAN_VIEW,
      },
      {
        title: "Instansi",
        path: "/master/instansi",
        permission: PERMISSIONS.MASTER_INSTANSI_VIEW,
      },
      {
        title: "Unit Kerja",
        path: "/master/unor",
        permission: PERMISSIONS.MASTER_UNOR_VIEW,
      },
      {
        title: "Pendidikan",
        path: "/master/pendidikan",
        permission: PERMISSIONS.MASTER_PENDIDIKAN_VIEW,
      },
      {
        title: "Jabatan",
        path: "/master/jabatan",
        permission: PERMISSIONS.MASTER_JABATAN_VIEW,
      },
    ],
  },
]
