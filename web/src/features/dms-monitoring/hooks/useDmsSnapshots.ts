import { useQuery } from "@tanstack/react-query"

import { getDmsSnapshots } from "../api"
import type { DmsSnapshotFilters } from "../types"
import { DMS_MONITORING_QUERY_KEYS } from "../utils"

export function useDmsSnapshots(filters: DmsSnapshotFilters) {
  return useQuery({
    queryKey: DMS_MONITORING_QUERY_KEYS.snapshots(filters),
    queryFn: () => getDmsSnapshots(filters),
  })
}