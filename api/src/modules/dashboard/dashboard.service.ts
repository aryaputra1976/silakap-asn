import { Injectable, Logger } from "@nestjs/common"
import { DashboardQuery } from "./queries/dashboard.query"
import { DashboardSummaryDto } from "./dto/dashboard-summary.dto"
import { CacheService } from "@/core/cache/cache.service"

interface DashboardContext {
  userId: bigint
  userName: string
  roleName: string
  bidangId?: bigint | null
  unitKerjaId?: bigint | null
  opd?: string | null
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name)

  constructor(
    private readonly query: DashboardQuery,
    private readonly cache: CacheService,
  ) {}

  /**
   * BUILD CACHE KEY (RBAC SAFE)
   */
  private buildCacheKey(ctx: DashboardContext): string {
    return [
      "dashboard:summary",
      ctx.userId.toString(),
      ctx.roleName,
      ctx.bidangId?.toString() ?? "null",
      ctx.unitKerjaId?.toString() ?? "null",
    ].join(":")
  }

  /**
   * DASHBOARD SUMMARY (RBAC + CACHE)
   */
  async getSummaryRBAC(
    ctx: DashboardContext,
  ): Promise<DashboardSummaryDto> {

    const cacheKey = this.buildCacheKey(ctx)

    /**
     * 1. TRY CACHE
     */
    try {
      const cached =
        await this.cache.get<DashboardSummaryDto>(cacheKey)

      if (cached) return cached
    } catch (err) {
      this.logger.warn("Cache GET failed", err)
    }

    /**
     * 2. QUERY DATA
     */
    const [stats, activities, notifications] =
      await Promise.all([
        this.query.getStatsRBAC(ctx),
        this.query.getActivitiesRBAC(ctx),
        this.query.getNotifications(ctx.userId),
      ])

    /**
     * 3. BUILD DTO
     */
    const dto: DashboardSummaryDto = {
      userName: ctx.userName,
      userRole: ctx.roleName,
      opd: ctx.opd ?? null,

      totalAsn: stats.totalAsn,
      totalUsul: stats.totalUsul,
      usulProses: stats.usulProses,
      usulSelesai: stats.usulSelesai,

      aktivitasTerbaru: activities,
      notifications: notifications,
    }

    /**
     * 4. SET CACHE (NON-BLOCKING)
     */
    this.cache
      .set(cacheKey, dto, 60) // TTL 60 detik
      .catch((err) =>
        this.logger.warn("Cache SET failed", err),
      )

    return dto
  }

  /**
   * OPTIONAL: FORCE REFRESH (untuk admin/debug)
   */
  async refreshSummaryRBAC(
    ctx: DashboardContext,
  ): Promise<DashboardSummaryDto> {

    const cacheKey = this.buildCacheKey(ctx)

    await this.cache.del(cacheKey).catch(() => null)

    return this.getSummaryRBAC(ctx)
  }

  /**
   * OPTIONAL: CLEAR USER CACHE
   */
  async clearUserCache(userId: bigint) {

    const pattern = `dashboard:summary:${userId.toString()}*`

    try {
      await this.cache.delByPattern(pattern)
    } catch (err) {
      this.logger.warn("Cache CLEAR failed", err)
    }
  }

  async getMonitoringRBAC(ctx: DashboardContext) {

    const [sla, bottleneck, longest] =
      await Promise.all([
        this.query.getSlaStats(ctx),
        this.query.getBottleneckStatus(ctx),
        this.query.getLongestProcess(ctx),
      ])

    return {
      sla,
      bottleneck,
      longestProcess: longest,
    }
  }  
}