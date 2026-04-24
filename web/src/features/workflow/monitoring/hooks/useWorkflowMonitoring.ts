import { useQuery } from "@tanstack/react-query"

import { getWorkflowMonitoring } from "../api/getWorkflowMonitoring.api"

export function useWorkflowMonitoring() {
  return useQuery({
    queryKey: ["workflow", "monitoring"],
    queryFn: getWorkflowMonitoring,
    staleTime: 30_000,
  })
}
