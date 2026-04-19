import { StatisticsAnalytics } from "../engine/analytics.interface"
import { getAsnSummary } from "../queries/asn-summary.query"

export const SummaryAnalytics: StatisticsAnalytics = {

  key: "summary",

  async run(prisma, where) {
    return getAsnSummary(prisma, where)
  }

}