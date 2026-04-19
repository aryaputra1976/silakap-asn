import { useQuery } from "@tanstack/react-query"
import { workforceKeys } from "../queryKeys"
import { getWorkforceDetail } from "../api/getWorkforceDetail.api"

export function useWorkforceDetail(tahun: number, unorId: number) {
  return useQuery({
    queryKey: workforceKeys.detail(tahun, unorId),
    queryFn: () => getWorkforceDetail(tahun, unorId),
    enabled: !!unorId,
  })
}