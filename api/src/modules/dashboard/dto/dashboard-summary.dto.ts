export interface DashboardSummaryDto {
  userName: string
  userRole: string
  opd: string | null

  totalAsn: number
  totalUsul: number
  usulProses: number
  usulSelesai: number

  aktivitasTerbaru: {
    id: number
    judul: string
    tanggal: string
  }[]

  notifications: {
    id: number
    message: string
    read: boolean
  }[]
}