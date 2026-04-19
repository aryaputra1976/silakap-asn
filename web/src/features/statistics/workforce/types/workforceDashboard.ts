import type { WorkforceProjection } from "./workforceProjection"
import type { WorkforceRisk } from "./workforceRisk"

export interface WorkforceSummary {

  totalAsn: number
  totalBebanKerja: number
  totalKebutuhan: number
  totalGap: number

  pensiun5Tahun: number
  rekomendasiFormasi: number

}

export interface WorkforceDashboard {

  summary: WorkforceSummary

  risk?: WorkforceRisk

  projection?: WorkforceProjection[]

}