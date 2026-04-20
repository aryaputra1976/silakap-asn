import { getRequest } from "@/core/http"

import type {
  DmsDashboardFilters,
  DmsDashboardResponse,
} from "../types"
import {
  buildDmsDashboardQueryParams,
  mapDmsDashboardResponse,
} from "../utils"

export async function getDmsDashboard(
  filters: DmsDashboardFilters = {},
): Promise<DmsDashboardResponse> {
  const response = await getRequest<Record<string, unknown>>(
    "/dms-monitoring/dashboard",
    {
      params: buildDmsDashboardQueryParams(filters),
    },
  )

  return mapDmsDashboardResponse(response)
}