export interface PensiunListItem {
  id: number
  status: string
  tanggal_usul: string
  jenis: {
    nama: string
  }
}

export interface PensiunListResponse {
  data: PensiunListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}