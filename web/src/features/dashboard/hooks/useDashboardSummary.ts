import { useQuery } from "@tanstack/react-query"
import { getDashboardSummary } from "../api/getDashboardSummary"

export function useDashboardSummary(unorId?: number) {
  return useQuery({
    queryKey: ["dashboard-summary", unorId ?? "all"],
    queryFn: () => getDashboardSummary(unorId),
  })
}
