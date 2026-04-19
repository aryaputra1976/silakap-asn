import { StatisticsAnalytics } from "../engine/analytics.interface"

import { getAsnOpdStats } from "../queries/asn-opd.query"
import { getOpdHeatmap } from "../queries/asn-opd-heatmap.query"

export const OrganizationAnalytics: StatisticsAnalytics = {

  key: "organization",

  async run(prisma, where) {

    const [opd, heatmap] = await Promise.all([
      getAsnOpdStats(prisma, where),
      getOpdHeatmap(prisma, where)
    ])

    return { opd, heatmap }
  }

}