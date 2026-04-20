import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import type { Response } from 'express'

import { JwtGuard } from '@/core/auth/jwt.guard'
import { Public } from '@/core/decorators/public.decorator'

import { ServicesDashboardService } from '../service/services.dashboard.service'
import { ServicesQueryService } from '../service/services.query.service'
import { ServicesService } from '../service/services.service'

@Controller('services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService = new ServicesService(),
    private readonly queryService: ServicesQueryService = new ServicesQueryService(),
    private readonly dashboardService: ServicesDashboardService = new ServicesDashboardService(),
  ) {}

  private isLegacyRequest(
    value: unknown,
  ): value is {
    params?: Record<string, string>
    body?: Record<string, unknown>
    user?: { id?: bigint | string | null; role?: string | null; roles?: string[] }
  } {
    return typeof value === 'object' && value !== null && 'params' in value
  }

  private isLegacyResponse(
    value: unknown,
  ): value is Response {
    return (
      typeof value === 'object' &&
      value !== null &&
      'json' in value &&
      typeof (value as Response).json === 'function'
    )
  }

  private async respondLegacy(
    payload: Promise<unknown>,
    res?: Response,
  ) {
    const result = await payload

    if (res) {
      return res.json(result)
    }

    return result
  }

  @Public()
  @Get(':service/dashboard')
  async dashboard(
    @Param('service') serviceOrReq: string | {
      params?: Record<string, string>
    },
    @Body() legacyRes?: Response,
  ) {
    const service =
      typeof serviceOrReq === 'string'
        ? serviceOrReq
        : serviceOrReq.params?.service ?? ''

    return this.respondLegacy(
      this.dashboardService.getDashboard(service),
      this.isLegacyResponse(legacyRes) ? legacyRes : undefined,
    )
  }

  @Get(':service')
  async list(
    @Param('service') serviceOrReq: string | {
      params?: Record<string, string>
    },
    @Body() legacyRes?: Response,
  ) {
    const service =
      typeof serviceOrReq === 'string'
        ? serviceOrReq
        : serviceOrReq.params?.service ?? ''

    return this.respondLegacy(
      this.queryService.listByServiceCode(service),
      this.isLegacyResponse(legacyRes) ? legacyRes : undefined,
    )
  }

  @Get(':service/:id')
  async getById(
    @Param('id') idOrReq: string | {
      params?: Record<string, string>
    },
    @Body() legacyRes?: Response,
  ) {
    const id =
      typeof idOrReq === 'string'
        ? idOrReq
        : idOrReq.params?.id ?? ''

    return this.respondLegacy(
      this.queryService.getById(BigInt(id)),
      this.isLegacyResponse(legacyRes) ? legacyRes : undefined,
    )
  }

  @Post(':service')
  async create(
    @Param('service') serviceOrReq: string | {
      params?: Record<string, string>
      body?: unknown
    },
    @Body() bodyOrRes?: unknown,
  ) {
    const isLegacy = this.isLegacyRequest(serviceOrReq)
    const service = isLegacy
      ? serviceOrReq.params?.service ?? ''
      : String(serviceOrReq)
    const body = isLegacy ? serviceOrReq.body : bodyOrRes
    const res =
      !isLegacy && this.isLegacyResponse(bodyOrRes)
        ? bodyOrRes
        : this.isLegacyResponse(bodyOrRes)
          ? bodyOrRes
          : undefined

    return this.respondLegacy(
      this.servicesService.create(service, body),
      res,
    )
  }

  @Post(':service/submit')
  @UseGuards(JwtGuard)
  async submit(
    @Param('service') serviceOrReq: any,
    @Body() bodyOrRes?: any,
    @Req() req?: any,
  ) {
    const isLegacy = this.isLegacyRequest(serviceOrReq)
    const service = isLegacy
      ? serviceOrReq.params?.service ?? ''
      : String(serviceOrReq)
    const body = isLegacy
      ? serviceOrReq.body
      : this.isLegacyResponse(bodyOrRes)
        ? undefined
        : bodyOrRes
    const user = isLegacy
      ? serviceOrReq.user ?? {}
      : req?.user ?? {}
    return this.respondLegacy(
      this.servicesService.submit(
        service,
        body,
        user,
      ),
      !isLegacy && this.isLegacyResponse(bodyOrRes)
        ? bodyOrRes
        : undefined,
    )
  }

  @Post(':service/workflow')
  @UseGuards(JwtGuard)
  async workflow(
    @Param('service') serviceOrReq: any,
    @Body() bodyOrRes?: any,
    @Req() req?: any,
  ) {
    const isLegacy = this.isLegacyRequest(serviceOrReq)
    const service = isLegacy
      ? serviceOrReq.params?.service ?? ''
      : String(serviceOrReq)
    const body = isLegacy
      ? serviceOrReq.body
      : this.isLegacyResponse(bodyOrRes)
        ? undefined
        : bodyOrRes
    const user = isLegacy
      ? serviceOrReq.user ?? {}
      : req?.user ?? {}

    return this.respondLegacy(
      this.servicesService.workflow(
        service,
        body,
        user,
      ),
      !isLegacy && this.isLegacyResponse(bodyOrRes)
        ? bodyOrRes
        : undefined,
    )
  }
}
