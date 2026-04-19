import { Controller, Get, Query } from "@nestjs/common"
import { StatisticsService } from "./statistics.service"
import { QueryStatisticsDto } from "./dto/query-statistics.dto"

@Controller("statistics")
export class StatisticsController {

  constructor(private readonly statisticsService: StatisticsService) {}

  /**
   * Statistik ASN lengkap
   */
  @Get("asn")
  async getAsnStatistics(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getAsnStatistics(query)
  }

  /**
   * Workforce Analytics
   */

  @Get("analytics/summary")
  async getSummary(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getAnalytics("summary", query)
  }

  @Get("analytics/distribution")
  async getDistribution(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getAnalytics("distribution", query)
  }

  @Get("analytics/opd")
  async getOpdStatistics(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getAnalytics("organization", query)
  }

  @Get("analytics/retirement")
  async getRetirementPrediction(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getAnalytics("retirement", query)
  }

  @Get("dashboard")
  async getDashboard(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getAsnStatistics(query)
  }  
}