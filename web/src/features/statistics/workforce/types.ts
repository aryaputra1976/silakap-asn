import type { WorkforceOpd } from "./types/workforceOpd"

export * from "./types/workforceOpd"

export * from "./types/workforceDashboard"

export * from "./types/workforceProjection"

export * from "./types/workforceRisk"

export * from "./types/demandForecast"

export * from "./types/workforce-tree"

export interface WorkforceDetail {
  unorId: number
  namaUnor: string
  asnEksisting: number
  totalBebanKerja: number
  kebutuhanAsn: number
  gapAsn: number
  pensiun5Tahun: number
  rekomendasiFormasi: number
}

export interface PensionRiskData {
  jabatan: {
    jabatan: string
    jumlah: number
  }[]
  opd: {
    opd: string
    jabatan: string
    jumlah: number
  }[]
  heatmap: WorkforceOpd[]
}
