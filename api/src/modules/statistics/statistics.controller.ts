import { Controller, Get, Query, Res } from "@nestjs/common"
import { StatisticsService } from "./statistics.service"
import { QueryStatisticsDto } from "./dto/query-statistics.dto"
import { QueryEmployeeReportExportDto } from "./dto/query-employee-report-export.dto"
import type { Response } from "express"

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

  @Get("reports/employee")
  async getEmployeeReports(@Query() query: QueryStatisticsDto) {
    return this.statisticsService.getEmployeeReports(query)
  }

  @Get("reports/employee/export")
  async exportEmployeeReports(
    @Query() query: QueryEmployeeReportExportDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const exported = await this.statisticsService.exportEmployeeReports(query)

    res.setHeader("Content-Type", exported.contentType)

    if (exported.disposition) {
      res.setHeader("Content-Disposition", exported.disposition)
    }

    return exported.content
  }
}
