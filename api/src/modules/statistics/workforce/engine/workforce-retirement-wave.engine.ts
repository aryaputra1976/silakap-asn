export interface RetirementWaveRow {
  tahun: number
  total: number
}

export class WorkforceRetirementWaveEngine {

  calculate(
    tahunMulai: number,
    rows: { tahun: number, total: number }[]
  ): RetirementWaveRow[] {

    const result: RetirementWaveRow[] = []

    const map = new Map<number, number>()

    rows.forEach(r => {
      map.set(Number(r.tahun), Number(r.total))
    })

    for (let i = 0; i < 20; i++) {

      const tahun = tahunMulai + i

      result.push({
        tahun,
        total: map.get(tahun) ?? 0
      })

    }

    return result

  }

}