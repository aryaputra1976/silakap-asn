import {
  Controller,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
} from "@nestjs/common"
import { Request } from "express"
import { ApiBearerAuth, ApiTags, ApiOperation } from "@nestjs/swagger"

import { DashboardService } from "./dashboard.service"
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard"

interface AuthUser {
  id: string
  name: string
  role: string
  bidangId?: string | null
  unitKerjaId?: string | null
  opd?: string | null
}

@ApiTags("Dashboard")
@ApiBearerAuth("bearerAuth")
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  /**
   * DASHBOARD SUMMARY
   */
  @UseGuards(JwtAuthGuard)
  @Get("summary")
  @ApiOperation({ summary: "Get dashboard summary (RBAC aware)" })
  async summary(@Req() req: Request & { user?: AuthUser }) {
    const user = req.user

    /**
     * Defensive auth check
     */
    if (!user?.id) {
      throw new UnauthorizedException("User not authenticated")
    }

    return this.service.getSummaryRBAC({
      userId: BigInt(user.id),
      userName: user.name,
      roleName: user.role,
      bidangId: user.bidangId ? BigInt(user.bidangId) : null,
      unitKerjaId: user.unitKerjaId ? BigInt(user.unitKerjaId) : null,
      opd: user.opd ?? null,
    })
  }

  /**
   * FORCE REFRESH DASHBOARD CACHE
   */
  @UseGuards(JwtAuthGuard)
  @Get("refresh")
  @ApiOperation({ summary: "Force refresh dashboard cache" })
  async refresh(@Req() req: Request & { user?: AuthUser }) {
    const user = req.user

    if (!user?.id) {
      throw new UnauthorizedException("User not authenticated")
    }

    return this.service.refreshSummaryRBAC({
      userId: BigInt(user.id),
      userName: user.name,
      roleName: user.role,
      bidangId: user.bidangId ? BigInt(user.bidangId) : null,
      unitKerjaId: user.unitKerjaId ? BigInt(user.unitKerjaId) : null,
      opd: user.opd ?? null,
    })
  }

  /**
   * CLEAR DASHBOARD CACHE (DEBUG / ADMIN)
   */
  @UseGuards(JwtAuthGuard)
  @Get("clear-cache")
  @ApiOperation({ summary: "Clear dashboard cache for current user" })
  async clearCache(@Req() req: Request & { user?: AuthUser }) {
    const user = req.user

    if (!user?.id) {
      throw new UnauthorizedException("User not authenticated")
    }

    await this.service.clearUserCache(BigInt(user.id))

    return {
      success: true,
      message: "Dashboard cache cleared",
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("monitoring")
  @ApiOperation({ summary: "Dashboard monitoring (SLA & bottleneck)" })
  async monitoring(@Req() req: Request & { user?: AuthUser }) {

    const user = req.user

    if (!user?.id) {
      throw new UnauthorizedException("User not authenticated")
    }

    return this.service.getMonitoringRBAC({
      userId: BigInt(user.id),
      userName: user.name,
      roleName: user.role,
      bidangId: user.bidangId ? BigInt(user.bidangId) : null,
      unitKerjaId: user.unitKerjaId ? BigInt(user.unitKerjaId) : null,
      opd: user.opd ?? null,
    })
  }

}