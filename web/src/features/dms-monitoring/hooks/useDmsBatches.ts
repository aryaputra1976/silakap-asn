import { useQuery } from "@tanstack/react-query"

import { getDmsBatches } from "../api"
import type { DmsBatchFilters } from "../types"
import { DMS_MONITORING_QUERY_KEYS } from "../utils"

export function useDmsBatches(filters: DmsBatchFilters) {
  return useQuery({
    queryKey: DMS_MONITORING_QUERY_KEYS.batches(filters),
    queryFn: () => getDmsBatches(filters),
  })
}