import type { RouteObject } from "react-router-dom"

import {
  DmsBatchDetailPage,
  DmsMonitoringPage,
} from "@/pages/dms-monitoring"

export const dmsMonitoringRoutes: RouteObject[] = [
  {
    path: "/dms-monitoring",
    element: <DmsMonitoringPage />,
  },
  {
    path: "/dms-monitoring/batches/:id",
    element: <DmsBatchDetailPage />,
  },
]

export default dmsMonitoringRoutes