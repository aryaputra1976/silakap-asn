export interface WorkforceOpdRisk {

  namaUnor: string
  asnEksisting: number
  kebutuhanAsn: number
  gapAsn: number

}

export interface WorkforceOpdRiskResult {

  namaUnor: string
  asnEksisting: number
  kebutuhanAsn: number
  gapAsn: number
  riskIndex: number

}

export class WorkforceOpdRiskEngine {

  calculate(data: WorkforceOpdRisk[]) {

    const mapped: WorkforceOpdRiskResult[] = data.map(d => {

      const riskIndex =
        d.kebutuhanAsn === 0
          ? 0
          : d.gapAsn / d.kebutuhanAsn

      return {
        ...d,
        riskIndex
      }

    })

    const sorted =
      mapped.sort((a, b) =>
        b.riskIndex - a.riskIndex
      )

    const top10 =
      sorted.slice(0, 10)

    const opdKritis =
      mapped.filter(o => o.riskIndex >= 0.30).length

    return {

      totalOpd: data.length,
      opdKritis,
      top10

    }

  }

}