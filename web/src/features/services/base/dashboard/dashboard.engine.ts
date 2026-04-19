import type { ComponentType } from "react"
import { getService } from "../registry"
import ServiceDashboardPage from "./pages/ServiceDashboardPage"

export function getDashboard(service: string): ComponentType {

  const svc = getService(service)

  if (svc?.dashboard?.override) {
    return svc.dashboard.override
  }

  return ServiceDashboardPage
}