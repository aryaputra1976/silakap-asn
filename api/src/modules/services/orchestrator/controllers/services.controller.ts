import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req
} from '@nestjs/common'

import { Prisma } from '@prisma/client'

import { prisma } from '@/core/prisma/prisma.client'
import { JwtGuard } from '@/core/auth/jwt.guard'
import { Public } from '@/core/decorators/public.decorator'

import { ServicesService } from '../service/services.service'
import { ServicesEngine } from '../services.engine'
import { ServicesQueryService } from '../service/services.query.service'
import { ServicesDashboardService } from '../service/services.dashboard.service'

const servicesService = new ServicesService()
const engine = new ServicesEngine()
const queryService = new ServicesQueryService()
const dashboardService = new ServicesDashboardService()

@Controller('services')
export class ServicesController {

  private async resolveActorRoleId(user: any) {

    const roleName =
      typeof user?.role === 'string' && user.role
        ? user.role
        : Array.isArray(user?.roles) && user.roles.length > 0
          ? user.roles[0]
          : null

    if (!roleName) {
      throw new Error('Role user tidak ditemukan')
    }

    const role = await prisma.silakapRole.findFirst({
      where: { name: roleName },
      select: { id: true }
    })

    if (!role) {
      throw new Error(`Role ${roleName} tidak ditemukan`)
    }

    return role.id

  }

  private async resolveUsulContext(usulId: bigint) {

    const usul = await prisma.silakapUsulLayanan.findUnique({
      where: { id: usulId },
      select: {
        pegawaiId: true,
        jenisLayananId: true
      }
    })

    if (!usul) {
      throw new Error('Usul layanan tidak ditemukan')
    }

    return usul

  }

  private async normalizeCreateInput(
    service: string,
    body: any
  ) {

    const normalizedPayload =
      body?.payload && typeof body.payload === 'object'
        ? { ...body.payload }
        : { ...body }

    let resolvedPegawaiId = body?.pegawaiId

    if (!resolvedPegawaiId && typeof normalizedPayload.nip === 'string') {

      const pegawai = await prisma.silakapPegawai.findUnique({
        where: {
          nip: normalizedPayload.nip.trim()
        },
        select: { id: true }
      })

      if (!pegawai) {
        throw new Error('Pegawai tidak ditemukan dari NIP')
      }

      resolvedPegawaiId = pegawai.id.toString()

    }

    if (!resolvedPegawaiId) {
      throw new Error('pegawaiId tidak boleh kosong')
    }

    if (
      service.toUpperCase() === 'PENSIUN' &&
      !normalizedPayload.jenisPensiunId &&
      typeof normalizedPayload.jenisPensiun === 'string'
    ) {

      const jenisPensiun = await prisma.refJenisPensiun.findFirst({
        where: {
          kode: normalizedPayload.jenisPensiun.trim().toUpperCase(),
          deletedAt: null
        },
        select: { id: true }
      })

      if (!jenisPensiun) {
        throw new Error('Jenis pensiun tidak ditemukan')
      }

      normalizedPayload.jenisPensiunId = jenisPensiun.id

    }

    return {
      pegawaiId: BigInt(resolvedPegawaiId),
      payload: normalizedPayload
    }

  }

  /**
   * GET /api/services/:service/dashboard
   */
  @Public()
  @Get(':service/dashboard')
  async dashboard(
    @Param('service') service: string
  ) {
    return dashboardService.getDashboard(service)
  }

  /**
   * GET /api/services/:service
   */
  @Get(':service')
  async list(
    @Param('service') service: string
  ) {

    const jenis = await prisma.silakapJenisLayanan.findFirst({
      where: { kode: service },
      select: { id: true }
    })

    if (!jenis) {
      return { message: 'Jenis layanan tidak ditemukan' }
    }

    return queryService.list({
      jenisLayananId: jenis.id
    })

  }

  /**
   * GET /api/services/:service/:id
   */
  @Get(':service/:id')
  async getById(
    @Param('id') id: string
  ) {

    return queryService.getById(
      BigInt(id)
    )

  }

  /**
   * CREATE USUL
   */
  @Post(':service')
  async create(
    @Param('service') service: string,
    @Body() body: any
  ) {

    const {
      pegawaiId,
      payload
    } = await this.normalizeCreateInput(service, body)

    const jenis = await prisma.silakapJenisLayanan.findFirst({
      where: { kode: service },
      select: { id: true }
    })

    if (!jenis) {
      throw new Error('Jenis layanan tidak ditemukan')
    }

    return prisma.$transaction(
      async (tx) => {

        return servicesService.createUsul(
          tx,
          BigInt(pegawaiId),
          jenis.id,
          service as any,
          payload
        )

      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
      }
    )

  }

  /**
   * SUBMIT USUL
   */
  @Post(':service/submit')
  @UseGuards(JwtGuard)
  async submit(
    @Param('service') service: string,
    @Body() body: any,
    @Req() req: any
  ) {

    const usulIdRaw = body?.usulId ?? body?.id

    if (!usulIdRaw) {
      throw new Error('usulId wajib diisi')
    }

    const usulId = BigInt(usulIdRaw)
    const actorRoleId = await this.resolveActorRoleId(req.user)
    const usulContext = await this.resolveUsulContext(usulId)

    const jenis = await prisma.silakapJenisLayanan.findFirst({
      where: { kode: service },
      select: { id: true }
    })

    if (!jenis) {
      throw new Error('Jenis layanan tidak ditemukan')
    }

    return prisma.$transaction(
      async (tx) => {

        return engine.execute(
          tx,
          {
            usulId,
            pegawaiId: body?.pegawaiId
              ? BigInt(body.pegawaiId)
              : usulContext.pegawaiId,
            jenisLayananId: jenis.id,
            actionCode: "SUBMIT",
            actorRoleId,
            actorUserId: req.user?.id
          }
        )

      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
      }
    )

  }

  /**
   * WORKFLOW ACTION
   */
  @Post(':service/workflow')
  @UseGuards(JwtGuard)
  async workflow(
    @Param('service') service: string,
    @Body() body: any,
    @Req() req: any
  ) {

    const {
      usulId,
      actionCode,
      pegawaiId,
      jenisLayananId
    } = body

    if (!usulId) {
      throw new Error('usulId wajib diisi')
    }

    if (!actionCode) {
      throw new Error('actionCode wajib diisi')
    }

    const normalizedUsulId = BigInt(usulId)
    const actorRoleId = await this.resolveActorRoleId(req.user)
    const usulContext = await this.resolveUsulContext(normalizedUsulId)

    const jenis =
      jenisLayananId
        ? { id: BigInt(jenisLayananId) }
        : await prisma.silakapJenisLayanan.findFirst({
            where: { kode: service },
            select: { id: true }
          })

    if (!jenis) {
      throw new Error('Jenis layanan tidak ditemukan')
    }

    return prisma.$transaction(
      async (tx) => {

        return engine.execute(
          tx,
          {
            usulId: normalizedUsulId,
            pegawaiId: pegawaiId
              ? BigInt(pegawaiId)
              : usulContext.pegawaiId,
            jenisLayananId: jenis.id,
            actionCode,
            actorRoleId,
            actorUserId: req.user?.id
          }
        )

      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
      }
    )

  }

}
