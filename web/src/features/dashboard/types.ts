export interface DashboardActivity {
  id: number
  judul: string
  tanggal: string
}

export interface DashboardNotification {
  id: number
  message: string
  read: boolean
}

export interface DashboardSummary {
  userName: string
  userRole: string | number | null
  opd?: string | null

  totalAsn: number
  totalUsul: number
  usulProses: number
  usulSelesai: number

  aktivitasTerbaru: DashboardActivity[]
  notifications: DashboardNotification[]
}