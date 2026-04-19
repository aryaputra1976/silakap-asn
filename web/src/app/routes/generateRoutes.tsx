import React, { lazy } from "react"
import type { RouteObject } from "react-router-dom"

import type { MenuItemConfig } from "@/app/navigation/menu.config"
import RouteGuard from "./RouteGuard"

/* =========================================================
 * STATIC PAGE MAP
 * ========================================================= */

const staticPageMap: Record<string, React.LazyExoticComponent<any>> = {

  "/dashboard": lazy(
    () => import("@/features/dashboard/pages/DashboardPage")
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

  "/workflow/disposisi": lazy(
    () => import("@/features/workflow/disposisi/pages/DisposisiPage")
  ),

  "/workflow/monitoring": lazy(
    () => import("@/features/workflow/monitoring/pages/MonitoringPage")
  ),

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

/* =========================================================
 * ROUTE GENERATOR
 * ========================================================= */

export function generateRoutes(
  menu: MenuItemConfig[]
): RouteObject[] {

  const routes: RouteObject[] = []

  const combinedMap = {
    ...staticPageMap,
    ...masterPageMap,
  }

  const addedPaths = new Set<string>()

  function walk(items: MenuItemConfig[]) {

    for (const item of items) {

      if (
        item.path &&
        combinedMap[item.path] &&
        !addedPaths.has(item.path)
      ) {

        const Page = combinedMap[item.path]

        routes.push({
          path: item.path,
          element: (
            <RouteGuard permission={item.permission}>
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
