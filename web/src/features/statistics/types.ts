export interface AsnSummary {
  total: number
  pns: number
  pppk: number
  pppkParuhWaktu: number
}

export interface GolonganStat {
  golongan: string
  jumlah: number
}

export interface JabatanStat {
  jabatan: string
  jumlah: number
}

export interface UsiaStat {
  range: string
  jumlah: number
}

export interface OpdStat {
  unorId: number | null
  namaUnor: string
  total: number
  pns: number
  pppk: number
  pppkParuhWaktu: number
}

export interface RankingStat {
  namaUnor?: string
  total?: number
}

export interface AsnStatistics {

  summary: AsnSummary

  distribution: {
    golongan: GolonganStat[]
    jabatan: JabatanStat[]
    usia: UsiaStat[]
    pendidikan: any[]
    gender: any[]
  }

  organization: {
    opd: OpdStat[]
    heatmap?: any[]
  }

  ranking: RankingStat[]

  retirement?: any

  workforce?: any
}

export interface WorkforceDemandRow {
  opd: string
  jabatan: string
  kebutuhan: number
  asnEksisting: number
  gap: number
}

export interface WorkforceProjection {
  tahun: number
  pensiun: number
}

export interface WorkforceRisk {
  risikoKekurangan: number
  opdTertinggi?: string
  tahunPuncak?: number
}

export interface WorkforceDashboard {

  totalAsn: number
  kebutuhanAsn: number
  gapAsn: number

  pensiun5Tahun: number
  rekomendasiFormasi: number

  projection: WorkforceProjection[]

  risk?: WorkforceRisk

  opdRisk?: {
    opd: string
    total: number
  }[]

  heatmap?: {
    opd: string
    jabatan: string
    jumlah: number
  }[]

  demandForecast?: WorkforceDemandRow[]
}

