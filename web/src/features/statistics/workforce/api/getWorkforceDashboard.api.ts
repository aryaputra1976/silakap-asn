import http from "@/core/http/httpClient"
import type { WorkforceDashboard } from "../types"

export async function getWorkforceDashboard(
  tahun: number
): Promise<WorkforceDashboard> {
  const { data } = await http.get(`/statistics/workforce/dashboard`, {
    params: { tahun },
  })
  return data
}