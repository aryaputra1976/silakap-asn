import { Injectable } from "@nestjs/common"

import { QueryStatisticsDto } from "./dto/query-statistics.dto"

import { PrismaService } from "@/prisma/prisma.service"
import { UnorTreeService } from "./services/unor-tree.service"
import { StatisticsCacheService } from "./services/statistics-cache.service"
import { StatisticsEngineService } from "./services/statistics-engine.service"

import { buildUnorWhere } from "./utils/build-unor-filter.util"
import { buildStatisticsKey } from "./utils/statistics-key.util"
import { normalizeBigInt } from "@/utils/normalizeBigInt"

@Injectable()
export class StatisticsService {

  constructor(
    private prisma: PrismaService,
    private unorTreeService: UnorTreeService,
    private cache: StatisticsCacheService,
    private engine: StatisticsEngineService
  ) {}

  /**
   * Build WHERE filter untuk seluruh query
   */
  private async buildWhere(query: QueryStatisticsDto) {

    let unorIds: bigint[] | undefined

    if (query.unorId) {
      unorIds = await this.unorTreeService.getSubtreeIds(
        BigInt(query.unorId)
      )
    }

    return {
      deletedAt: null,
      statusAktif: true,
      ...buildUnorWhere(unorIds)
    }
  }

  /**
   * Endpoint utama statistik ASN
   * GET /statistics/asn
   */
  async getAsnStatistics(query: QueryStatisticsDto) {

    const cacheKey = buildStatisticsKey(query)

    const cached = this.cache.get(cacheKey)

    if (cached) {
      return cached
    }

    const where = await this.buildWhere(query)

    const result = await this.engine.run(where)

    const normalized = normalizeBigInt(result)

    this.cache.set(cacheKey, normalized)

    return normalized
  }

  /**
   * Ambil bagian analytics tertentu
   */
  async getAnalytics(type: string, query: QueryStatisticsDto) {

    const data = await this.getAsnStatistics(query)

    switch (type) {

      case "summary":
        return data.summary

      case "distribution":
        return data.distribution

      case "organization":
        return data.organization

      case "retirement":
        return data.retirement

      case "workforce":
        return data.workforce

      case "ranking":
        return data.ranking

      default:
        return data
    }
  }

}