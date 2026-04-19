import { useQuery } from "@tanstack/react-query"
import { getDashboardData } from "../api/getDashboardData"

export function useDashboardData() {

  return useQuery({
    queryKey: ["dashboard-data"],
    queryFn: getDashboardData
  })

}