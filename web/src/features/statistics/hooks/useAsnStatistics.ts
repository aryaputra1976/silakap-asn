import { useQuery } from "@tanstack/react-query"
import { getAsnStatistics } from "../api/getAsnStatistics.api"
import { statisticsKeys } from "../queryKeys"

export function useAsnStatistics(tahun?: number) {
  return useQuery({
    queryKey: statisticsKeys.asn(tahun),
    queryFn: () => getAsnStatistics(tahun),
  })
}