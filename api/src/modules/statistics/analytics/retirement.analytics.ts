import { StatisticsAnalytics } from "../engine/analytics.interface"

import { getRetirementPrediction } from "../queries/asn-retirement-prediction.query"
import { getRetirementByOpd } from "../queries/asn-retirement-opd.query"

export const RetirementAnalytics: StatisticsAnalytics = {

  key: "retirement",

  async run(prisma, where) {

    const [
      prediction,
      byOpd
    ] = await Promise.all([
      getRetirementPrediction(prisma, where),
      getRetirementByOpd(prisma)
    ])

    return {
      prediction,
      byOpd
    }
  }

}