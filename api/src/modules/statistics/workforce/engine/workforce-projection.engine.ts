export class WorkforceProjectionEngine {

  projection(
    tahun: number,
    rows: { tahun: number; total: number }[]
  ) {

    const map = new Map<number, number>()

    rows.forEach(r => {
      map.set(Number(r.tahun), Number(r.total))
    })

    const result: {
      tahun: number
      pensiun: number
    }[] = []

    for (let i = 0; i < 5; i++) {

      const year = tahun + i

      result.push({
        tahun: year,
        pensiun: map.get(year) ?? 0
      })

    }

    return result

  }

}