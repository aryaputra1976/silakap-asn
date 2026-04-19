import { StatisticsAnalytics } from "../engine/analytics.interface"

import { getWorkforceGap } from "../queries/workforce-gap.query"
import { getWorkforceProjection } from "../queries/workforce-projection.query"
import { getIdealWorkforceByJabatan } from "../queries/workforce-ideal.query"

export const WorkforceAnalytics: StatisticsAnalytics = {

  key: "workforce",

  async run(prisma, where) {

    const [
      gap,
      projection,
      idealByJabatan
    ] = await Promise.all([
      getWorkforceGap(prisma),
      getWorkforceProjection(prisma),
      getIdealWorkforceByJabatan(prisma)
    ])

    return {
      gap,
      projection,
      idealByJabatan
    }

  }

}