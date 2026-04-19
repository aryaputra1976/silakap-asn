import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { workforceKeys } from "../queryKeys"
import { getWorkforceOpd } from "../api/getWorkforceOpd.api"

export function useWorkforceOpd(tahun: number) {
  return useQuery({
    queryKey: workforceKeys.opd(tahun),
    queryFn: () => getWorkforceOpd(tahun),

    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData
  })
}