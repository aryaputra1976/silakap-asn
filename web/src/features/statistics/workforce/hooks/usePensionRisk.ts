import { useQuery } from "@tanstack/react-query"
import { workforceKeys } from "../queryKeys"
import { getPensionRisk } from "../api/getPensionRisk.api"

export function usePensionRisk(tahun: number) {
  return useQuery({
    queryKey: workforceKeys.pensionRisk(tahun),
    queryFn: () => getPensionRisk(tahun),
    enabled: !!tahun,
  })
}
