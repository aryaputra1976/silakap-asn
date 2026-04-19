export interface ServiceDashboardStats {
  total: number
  draft: number
  submitted: number
  verification: number
  approved: number
  rejected: number
}

export interface ServiceDashboardChartItem {
  status: string
  count: number
}

export interface ServiceDashboardRecent {
  id: string
  nomor: string
  pemohon: string
  status: string
  createdAt: string
}

export interface ServiceDashboardData {
  stats: ServiceDashboardStats
  chart: ServiceDashboardChartItem[]
  recent: ServiceDashboardRecent[]
}