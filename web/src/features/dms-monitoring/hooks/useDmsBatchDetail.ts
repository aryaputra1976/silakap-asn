import { useQuery } from "@tanstack/react-query"

import { getDmsBatchDetail } from "../api"
import { DMS_MONITORING_QUERY_KEYS } from "../utils"

export function useDmsBatchDetail(id?: string) {
  return useQuery({
    queryKey: id
      ? DMS_MONITORING_QUERY_KEYS.batchDetail(id)
      : DMS_MONITORING_QUERY_KEYS.batchDetail("unknown"),
    queryFn: () => getDmsBatchDetail(id as string),
    enabled: Boolean(id),
  })
}