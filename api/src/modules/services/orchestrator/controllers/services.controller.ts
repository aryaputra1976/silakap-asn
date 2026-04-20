import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import type { Request } from 'express'

import { JwtGuard } from '@/core/auth/jwt.guard'
import { Public } from '@/core/decorators/public.decorator'

import { ServicesDashboardService } from '../service/services.dashboard.service'
import { ServicesQueryService } from '../service/services.query.service'
import { ServicesService } from '../service/services.service'

type OrchestratorUser = {
  id?: bigint | string | null
  role?: string | null
  roles?: string[]
}

type ServicesRequest = Request & {
  body?: Record<string, unknown>
  params: Record<string, string | undefined>
  user?: OrchestratorUser
}

@Controller('services')
export class ServicesController {
  constructor(
    private readonly servicesService?: ServicesService,
    private readonly queryService?: ServicesQueryService,
    private readonly dashboardService?: ServicesDashboardService,
  ) {}

  @Public()
  @Get(':service/dashboard')
  async dashboard(@Req() req: ServicesRequest) {
    return this.dashboardService!.getDashboard(
      String(req.params.service ?? ''),
    )
  }

  @Get(':service')
  async list(@Req() req: ServicesRequest) {
    return this.queryService!.listByServiceCode(
      String(req.params.service ?? ''),
    )
  }

  @Get(':service/:id')
  async getById(@Req() req: ServicesRequest) {
    return this.queryService!.getById(
      BigInt(String(req.params.id ?? '')),
    )
  }

  @Post(':service')
  async create(@Req() req: ServicesRequest) {
    return this.servicesService!.create(
      String(req.params.service ?? ''),
      req.body,
    )
  }

  @Post(':service/submit')
  @UseGuards(JwtGuard)
  async submit(@Req() req: ServicesRequest) {
    return this.servicesService!.submit(
      String(req.params.service ?? ''),
      req.body,
      req.user ?? {},
    )
  }

  @Post(':service/workflow')
  @UseGuards(JwtGuard)
  async workflow(@Req() req: ServicesRequest) {
    return this.servicesService!.workflow(
      String(req.params.service ?? ''),
      req.body,
      req.user ?? {},
    )
  }
}
