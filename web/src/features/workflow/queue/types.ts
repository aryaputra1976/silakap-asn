export interface UniversalQueueFilters {

  page?: number

  limit?: number

  search?: string

  status?: string

  jenis?: string

}

export interface UniversalQueueItem {

  id: number

  pegawaiId: number

  jenisLayananId: number

  status: string

  tanggalUsul: string

  pegawai: {

    nip: string

    nama: string

  }

  jenis: {

    nama: string

    kode: string

  }

}

export interface UniversalQueueMeta {

  page: number

  limit: number

  total: number

  totalPages: number

}

export interface UniversalQueueResponse {

  data: UniversalQueueItem[]

  meta: UniversalQueueMeta

}