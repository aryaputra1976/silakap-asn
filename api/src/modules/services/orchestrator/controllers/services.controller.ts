import {
  Body,
  Controller,
  Get,
  Param,
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
  user?: OrchestratorUser
}

@Controller('services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly queryService: ServicesQueryService,
    private readonly dashboardService: ServicesDashboardService,
  ) {}

  @Public()
  @Get(':service/dashboard')
  async dashboard(@Param('service') service: string) {
    return this.dashboardService.getDashboard(service)
  }

  @Get(':service')
  async list(@Param('service') service: string) {
    return this.queryService.listByServiceCode(service)
  }

  @Get(':service/:id')
  async getById(@Param('id') id: string) {
    return this.queryService.getById(BigInt(id))
  }

  @Post(':service')
  async create(
    @Param('service') service: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.servicesService.create(service, body)
  }

  @Post(':service/submit')
  @UseGuards(JwtGuard)
  async submit(
    @Param('service') service: string,
    @Body() body: Record<string, unknown>,
    @Req() req: ServicesRequest,
  ) {
    return this.servicesService.submit(
      service,
      body,
      req.user ?? {},
    )
  }

  @Post(':service/workflow')
  @UseGuards(JwtGuard)
  async workflow(
    @Param('service') service: string,
    @Body() body: Record<string, unknown>,
    @Req() req: ServicesRequest,
  ) {
    return this.servicesService.workflow(
      service,
      body,
      req.user ?? {},
    )
  }
}
