export interface WorkforceGapResult {

  totalBebanKerja: number
  kebutuhanAsn: number
  asnEksisting: number
  gapAsn: number
  rasioBebanKerja: number

}

export class WorkforceGapEngine {

  private JAM_KERJA_TAHUNAN = 1250

  calculate(workloadRows: any[], asnEksisting: number) {

    let totalBebanKerja = 0

    for (const row of workloadRows) {

      const volume =
        Number(row.volumeKerja ?? 0)

      const norma =
        Number(row.tugas?.normaWaktu ?? 0)

      totalBebanKerja += volume * norma

    }

    const kebutuhanAsn =
      Math.ceil(totalBebanKerja / this.JAM_KERJA_TAHUNAN)

    const gapAsn =
      kebutuhanAsn - asnEksisting

    return {

      totalBebanKerja,
      kebutuhanAsn,
      asnEksisting,
      gapAsn

    }

  }

}