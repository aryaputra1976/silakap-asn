import httpClient from "@/core/http/httpClient"

import type { WorkflowMonitoringResponse } from "../types"

export async function getWorkflowMonitoring(): Promise<WorkflowMonitoringResponse> {
  const response = await httpClient.get<WorkflowMonitoringResponse>("/dashboard/monitoring")

  return response.data
}
