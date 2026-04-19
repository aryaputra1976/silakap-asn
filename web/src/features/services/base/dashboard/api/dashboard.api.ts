import http from "@/core/http/httpClient"

export interface DashboardStat {
  status: string
  count: number
}

export interface DashboardRecent {
  id: string
  nomor: string
  pemohon: string
  status: string
  createdAt: string
}

export interface ServiceDashboardResponse {
  stats: DashboardStat[]
  recent: DashboardRecent[]
}

export async function getServiceDashboard(
  service: string
): Promise<ServiceDashboardResponse> {

  const res = await http.get(`/services/${service}/dashboard`)

  return res.data
}