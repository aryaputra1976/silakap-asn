export interface WorkforceRiskResult {

  risikoKekurangan: number
  kategori: string
  tahunRisikoPuncak: number | null

}

export class WorkforceRiskEngine {

  calculate(
    totalAsn: number,
    gapAsn: number,
    pensiun5Tahun: number,
    kebutuhanAsn: number,
    projection?: { tahun: number; pensiun: number }[]
  ): WorkforceRiskResult {

    if (!kebutuhanAsn || kebutuhanAsn === 0) {

      return {
        risikoKekurangan: 0,
        kategori: "AMAN",
        tahunRisikoPuncak: null
      }

    }

    const totalRisiko =
      gapAsn + pensiun5Tahun

    const ratio =
      totalRisiko / kebutuhanAsn

    let kategori = "AMAN"

    if (ratio >= 0.30)
      kategori = "KRITIS"
    else if (ratio >= 0.15)
      kategori = "WASPADA"

    let tahunRisikoPuncak: number | null = null

    if (projection && projection.length > 0) {

      const max =
        projection.reduce((a, b) =>
          b.pensiun > a.pensiun ? b : a
        )

      tahunRisikoPuncak = max.tahun

    }

    return {

      risikoKekurangan:
        Number((ratio * 100).toFixed(1)),

      kategori,

      tahunRisikoPuncak

    }

  }

}