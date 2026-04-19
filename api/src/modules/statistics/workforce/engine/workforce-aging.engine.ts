export interface WorkforceAgingResult {
  kurang30: number
  usia30_39: number
  usia40_49: number
  usia50plus: number
}

export class WorkforceAgingEngine {

  calculate(rows: { tanggal_lahir: Date }[]): WorkforceAgingResult {

    const now = new Date()
    const currentYear = now.getFullYear()

    let kurang30 = 0
    let usia30_39 = 0
    let usia40_49 = 0
    let usia50plus = 0

    rows.forEach(r => {

      if (!r.tanggal_lahir) return

      const age =
        currentYear -
        new Date(r.tanggal_lahir).getFullYear()

      if (age < 30) kurang30++
      else if (age < 40) usia30_39++
      else if (age < 50) usia40_49++
      else usia50plus++

    })

    return {
      kurang30,
      usia30_39,
      usia40_49,
      usia50plus
    }

  }

}