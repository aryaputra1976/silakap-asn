import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { workforceKeys } from "../queryKeys"
import { getWorkforceDashboard } from "../api/getWorkforceDashboard.api"
import type { WorkforceDashboard } from "../types"

export function useWorkforceDashboard(tahun: number) {
  return useQuery<WorkforceDashboard>({
    queryKey: workforceKeys.dashboard(tahun),
    queryFn: () => getWorkforceDashboard(tahun),

    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData
  })
}