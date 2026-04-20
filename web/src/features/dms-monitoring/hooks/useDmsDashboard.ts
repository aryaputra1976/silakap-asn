import { useQuery } from "@tanstack/react-query"

import { getDmsDashboard } from "../api"
import type { DmsDashboardFilters } from "../types"
import { DMS_MONITORING_QUERY_KEYS } from "../utils"

export function useDmsDashboard(filters: DmsDashboardFilters = {}) {
  return useQuery({
    queryKey: DMS_MONITORING_QUERY_KEYS.dashboard(filters),
    queryFn: () => getDmsDashboard(filters),
  })
}