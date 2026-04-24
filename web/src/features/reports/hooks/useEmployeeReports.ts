import { useQuery } from "@tanstack/react-query"
import {
  getEmployeeReports,
  type EmployeeReportsQuery
} from "../api/getEmployeeReports.api"

export function useEmployeeReports(query?: EmployeeReportsQuery) {
  return useQuery({
    queryKey: ["employee-reports", query?.unorId ?? "all"],
    queryFn: () => getEmployeeReports(query)
  })
}
