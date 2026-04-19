export type KelengkapanItem = {
  jenisId: bigint
  nama: string
  wajib: boolean
  status: boolean
}

export type KelengkapanBase = {
  pegawaiId: bigint
  layananId: bigint
  total: number
  terpenuhi: number
  isLengkap: boolean
  items: KelengkapanItem[]
}

export type KelengkapanResult = KelengkapanBase & {

  /**
   * Helper untuk orchestration engine
   */
  isComplete: boolean

  /**
   * Nama dokumen yang belum lengkap
   */
  missing: string[]

}

export type KelengkapanStatus = KelengkapanBase