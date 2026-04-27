import React, { lazy } from "react"
import type { RouteObject } from "react-router-dom"

import type { MenuItemConfig } from "@/app/navigation/menu.config"
import RouteGuard from "./RouteGuard"
import EmployeeReportsPage from "@/features/reports/pages/EmployeeReportsPage"
import {
  DokumenPegawaiPage,
  DokumenUsulanPage,
  KelengkapanDokumenPage,
} from "@/features/documents/pages/DocumentsWorkspacePages"
import DmsMonitoringPage from "@/pages/dms-monitoring/DmsMonitoringPage"
import DmsBatchDetailPage from "@/pages/dms-monitoring/DmsBatchDetailPage"
import {
  ReferenceAsnPage,
  ReferenceDocumentPage,
  ReferenceOrganizationPage,
} from "@/features/reference/pages/ReferenceHubPage"
import {
  RoleSettingsPage,
  WorkflowSettingsPage,
} from "@/features/system/pages/SystemSettingsPages"
import UserRegistrationPage from "@/features/security/users/pages/UserRegistrationPage"

/* =========================================================
 * STATIC PAGE MAP
 * ========================================================= */

const staticPageMap: Record<string, React.LazyExoticComponent<any>> = {

  "/dashboard": lazy(
    () => import("@/features/dashboard/pages/DashboardPage")
  ),

  "/data-asn/profil": lazy(
    () => import("@/features/profil-asn/pages/ProfilPage")
  ),

  "/data-asn/pegawai": lazy(
    () => import("@/features/profil-asn/pages/ProfilPage")
  ),

  "/data-asn/riwayat": lazy(
    () => import("@/features/data-asn/pages/DataAsnSupportPages").then((m) => ({
      default: m.RiwayatAsnPage,
    }))
  ),

  "/data-asn/kelengkapan": lazy(
    () => import("@/features/data-asn/pages/DataAsnSupportPages").then((m) => ({
      default: m.KelengkapanDataPage,
    }))
  ),

  "/dashboard/workforce": lazy(
    () =>
      import(
        "@/features/statistics/workforce/pages/WorkforceDashboardPage"
      )
  ),

  "/asn/explorer": lazy(
    () => import("@/features/asn-explorer/pages/AsnExplorerPage")
  ),

  "/asn/profil": lazy(
    () => import("@/features/profil-asn/pages/ProfilPage")
  ),

  "/laporan/pegawai/jenis-kelamin": lazy(async () => ({
    default: EmployeeReportsPage,
  })),

  "/laporan/pegawai/pendidikan": lazy(async () => ({
    default: EmployeeReportsPage,
  })),

  "/laporan/pegawai/golongan": lazy(async () => ({
    default: EmployeeReportsPage,
  })),

  "/laporan/pegawai/jabatan": lazy(async () => ({
    default: EmployeeReportsPage,
  })),

  "/layanan/draft": lazy(
    () => import("@/features/services/workspace/pages/ServiceWorkspacePages").then((m) => ({
      default: m.DraftWorkspacePage,
    }))
  ),

  "/layanan/status": lazy(
    () => import("@/features/services/workspace/pages/ServiceWorkspacePages").then((m) => ({
      default: m.ServiceStatusWorkspacePage,
    }))
  ),

  "/referensi/asn": lazy(async () => ({
    default: ReferenceAsnPage,
  })),

  "/referensi/organisasi": lazy(async () => ({
    default: ReferenceOrganizationPage,
  })),

  "/referensi/dokumen": lazy(async () => ({
    default: ReferenceDocumentPage,
  })),

  /* =========================
     SERVICES (DYNAMIC)
  ========================= */

  "/layanan/:service": lazy(
    () => import("@/features/services/base/engine/pages/ServiceListPage")
  ),

  "/layanan/:service/create": lazy(
    () => import("@/features/services/base/engine/pages/ServiceCreatePage")
  ),

  "/layanan/:service/:id": lazy(
    () => import("@/features/services/base/engine/pages/ServiceDetailPage")
  ),

  /* =========================
     WORKFLOW
  ========================= */

  "/workflow/antrian": lazy(
    () => import("@/features/workflow/queue/pages/UniversalQueuePage")
  ),

  "/workflow/queue": lazy(
    () => import("@/features/workflow/queue/pages/UniversalQueuePage")
  ),

  "/workflow/disposisi": lazy(
    () => import("@/features/workflow/disposisi/pages/DisposisiPage")
  ),

  "/workflow/monitoring": lazy(
    () => import("@/features/workflow/monitoring/pages/MonitoringPage")
  ),

  "/dokumen/usulan": lazy(async () => ({
    default: DokumenUsulanPage,
  })),

  "/dokumen/kelengkapan": lazy(async () => ({
    default: KelengkapanDokumenPage,
  })),

  "/dokumen/pegawai": lazy(async () => ({
    default: DokumenPegawaiPage,
  })),

  "/pengaturan/pengguna": lazy(async () => ({
    default: UserRegistrationPage,
  })),

  "/pengaturan/workflow": lazy(async () => ({
    default: WorkflowSettingsPage,
  })),

  "/pengaturan/role": lazy(async () => ({
    default: RoleSettingsPage,
  })),

  "/keamanan/audit-log": lazy(
    () => import("@/features/security/audit/pages/AuditListPage")
  ),

  "/keamanan/activity": lazy(
    () => import("@/features/security/activity/pages/ActivityListPage")
  ),

  "/security/users": lazy(async () => ({
    default: UserRegistrationPage,
  })),

  "/dms-monitoring": lazy(async () => ({
    default: DmsMonitoringPage,
  })),

  "/dms-monitoring/batches/:id": lazy(async () => ({
    default: DmsBatchDetailPage,
  })),

  /* =========================
     STATISTICS
  ========================= */

  "/statistics/asn": lazy(
    () => import("@/features/statistics/pages/AsnStatisticsPage")
  ),

  "/statistics/distribution": lazy(
    () => import("@/features/statistics/pages/AsnStatisticsPage")
  ),

  "/statistics/opd": lazy(
    () => import("@/features/statistics/pages/AsnStatisticsPage")
  ),

  "/statistics/retirement": lazy(
    () => import("@/features/statistics/pages/AsnStatisticsPage")
  ),

  "/statistics/workforce": lazy(
    () =>
      import(
        "@/features/statistics/workforce/pages/WorkforceDashboardPage"
      )
  ),

  "/statistics/workforce/opd": lazy(
    () =>
      import(
        "@/features/statistics/workforce/pages/WorkforceOpdPage"
      )
  ),

  "/integrasi/import": lazy(
    () => import("@/features/integrasi/pages/IntegrasiImportPage")
  ),

  "/integrasi/log": lazy(
    () => import("@/features/integrasi/pages/IntegrasiLogsPage")
  ),

  "/integrasi/jobs": lazy(
    () => import("@/features/integrasi/pages/IntegrasiJobsPage")
  ),

  "/integrasi/siasn": lazy(
    () => import("@/features/integrasi/pages/IntegrasiSiasnPage")
  ),

  "/integrasi/import-referensi": lazy(
    () => import("@/features/integrasi/pages/IntegrasiReferenceImportPage")
  ),    
}

/* =========================================================
 * AUTO MASTER REGISTRY
 * ========================================================= */

const masterModules = import.meta.glob(
  "@/features/master/**/**Page.tsx"
)

function buildMasterPageMap() {

  const map: Record<string, React.LazyExoticComponent<any>> = {}

  Object.entries(masterModules).forEach(([path, loader]) => {

    const match = path.match(/master\/([^/]+)\/[^/]+Page\.tsx$/)

    if (!match) return

    const folder = match[1]

    const routePath = `/master/${folder}`
    const legacyRoutePath = `/settings/master/${folder}`

    map[routePath] = lazy(loader as any)
    map[legacyRoutePath] = map[routePath]

  })

  return map
}

const masterPageMap = buildMasterPageMap()

const combinedRouteMap = {
  ...staticPageMap,
  ...masterPageMap,
}

const MASTER_REFERENCE_ROLES = ["ADMIN_BKPSDM", "SUPER_ADMIN"]

export function hasRegisteredStaticRoute(path: string): boolean {
  return Boolean(combinedRouteMap[path])
}

/* =========================================================
 * ROUTE INTEGRASI
 * ========================================================= */


/* =========================================================
 * ROUTE GENERATOR
 * ========================================================= */

export function generateRoutes(
  menu: MenuItemConfig[]
): RouteObject[] {

  const routes: RouteObject[] = []

  const addedPaths = new Set<string>()

  function walk(items: MenuItemConfig[]) {

    for (const item of items) {

      if (
        item.path &&
        combinedRouteMap[item.path] &&
        !addedPaths.has(item.path)
      ) {

        const Page = combinedRouteMap[item.path]

        routes.push({
          path: item.path,
          element: (
            <RouteGuard
              permission={item.permission}
              permissionAny={item.permissionAny}
              rolesAny={item.rolesAny}
            >
              <Page />
            </RouteGuard>
          ),
        })

        addedPaths.add(item.path)

      }

      if (item.children) {
        walk(item.children)
      }

    }

  }

  walk(menu)

  return routes
}

export function generateMasterRoutes(): RouteObject[] {
  return Object.entries(masterPageMap).map(([path, Page]) => ({
    path,
    element: (
      <RouteGuard rolesAny={MASTER_REFERENCE_ROLES}>
        <Page />
      </RouteGuard>
    ),
  }))
}
