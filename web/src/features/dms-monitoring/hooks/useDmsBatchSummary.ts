import { useQuery } from "@tanstack/react-query"

import { getDmsBatchSummary } from "../api"
import { DMS_MONITORING_QUERY_KEYS } from "../utils"

export function useDmsBatchSummary(id?: string) {
  return useQuery({
    queryKey: id
      ? DMS_MONITORING_QUERY_KEYS.batchSummary(id)
      : DMS_MONITORING_QUERY_KEYS.batchSummary("unknown"),
    queryFn: () => getDmsBatchSummary(id as string),
    enabled: Boolean(id),
  })
}