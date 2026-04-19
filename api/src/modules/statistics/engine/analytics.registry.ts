import { StatisticsAnalytics } from "./analytics.interface"

import { SummaryAnalytics } from "../analytics/summary.analytics"
import { DistributionAnalytics } from "../analytics/distribution.analytics"
import { OrganizationAnalytics } from "../analytics/organization.analytics"
import { RetirementAnalytics } from "../analytics/retirement.analytics"
import { WorkforceAnalytics } from "../analytics/workforce.analytics"

export const analyticsRegistry: StatisticsAnalytics[] = [
  SummaryAnalytics,
  DistributionAnalytics,
  OrganizationAnalytics,
  RetirementAnalytics,
  WorkforceAnalytics
]