import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { BusinessError } from '@/core/errors/business.error'
import { PrismaService } from '@/prisma/prisma.service'

import { ServicesRegistry } from '../../registry/services.registry'
import { ServicesEngine } from '../services.engine'

type OrchestratorUser = {
  id?: bigint | string | null
  role?: string | null
  roles?: string[]
}

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: ServicesEngine,
  ) {}

  async createUsul(
    tx: Prisma.TransactionClient,
    pegawaiId: bigint,
    jenisLayananId: bigint,
    jenisKode: string,
    payload?: unknown,
  ) {
    if (!pegawaiId) {
      throw new BusinessError(
        'PEGAWAI_REQUIRED',
        'Pegawai tidak tersedia',
      )
    }

    if (!jenisLayananId) {
      throw new BusinessError(
        'LAYANAN_REQUIRED',
        'Jenis layanan tidak tersedia',
      )
    }

    if (!jenisKode) {
      throw new BusinessError(
        'SERVICE_CODE_REQUIRED',
        'Kode layanan tidak tersedia',
      )
    }

    const usul = await tx.silakapUsulLayanan.create({
      data: {
        pegawaiId,
        jenisLayananId,
        status: 'DRAFT',
        tanggalUsul: new Date(),
      },
      select: {
        id: true,
      },
    })

    const handler = ServicesRegistry.resolve(jenisKode as never)

    if (handler?.createDetail && !payload) {
      throw new BusinessError(
        'PAYLOAD_REQUIRED',
        `Payload untuk layanan ${jenisKode} wajib diisi`,
      )
    }

    if (handler?.createDetail) {
      await handler.createDetail(tx, usul.id, payload)
    }

    return {
      usulId: usul.id,
      jenisKode,
    }
  }

  async create(service: string, body: unknown) {
    const { pegawaiId, payload } = await this.normalizeCreateInput(
      service,
      body,
    )

    const jenisLayananId = await this.resolveJenisLayananId(service)

    return this.prisma.$transaction(
      async (tx) =>
        this.createUsul(
          tx,
          pegawaiId,
          jenisLayananId,
          service,
          payload,
        ),
      {
        isolationLevel:
          Prisma.TransactionIsolationLevel.Serializable,
      },
    )
  }

  async submit(
    service: string,
    body: Record<string, unknown> | undefined,
    user: OrchestratorUser,
  ) {
    const usulIdRaw = body?.usulId ?? body?.id

    if (!usulIdRaw) {
      throw new BusinessError(
        'USUL_REQUIRED',
        'usulId wajib diisi',
      )
    }

    const usulId = BigInt(String(usulIdRaw))
    const actorRoleId = await this.resolveActorRoleId(user)
    const usulContext = await this.resolveUsulContext(usulId)
    const jenisLayananId = await this.resolveJenisLayananId(service)

    return this.prisma!.$transaction(
      async (tx) =>
        this.engine.execute(tx, {
          usulId,
          pegawaiId: body?.pegawaiId
            ? BigInt(String(body.pegawaiId))
            : usulContext.pegawaiId,
          jenisLayananId,
          actionCode: 'SUBMIT',
          actorRoleId,
          actorUserId: user?.id
            ? BigInt(String(user.id))
            : undefined,
        }),
      {
        isolationLevel:
          Prisma.TransactionIsolationLevel.Serializable,
      },
    )
  }

  async workflow(
    service: string,
    body: Record<string, unknown> | undefined,
    user: OrchestratorUser,
  ) {
    const usulIdRaw = body?.usulId
    const actionCodeRaw = body?.actionCode

    if (!usulIdRaw) {
      throw new BusinessError(
        'USUL_REQUIRED',
        'usulId wajib diisi',
      )
    }

    if (!actionCodeRaw) {
      throw new BusinessError(
        'ACTION_REQUIRED',
        'actionCode wajib diisi',
      )
    }

    const usulId = BigInt(String(usulIdRaw))
    const actorRoleId = await this.resolveActorRoleId(user)
    const usulContext = await this.resolveUsulContext(usulId)

    const jenisLayananId = body?.jenisLayananId
      ? BigInt(String(body.jenisLayananId))
      : await this.resolveJenisLayananId(service)

    return this.prisma.$transaction(
      async (tx) =>
        this.engine.execute(tx, {
          usulId,
          pegawaiId: body?.pegawaiId
            ? BigInt(String(body.pegawaiId))
            : usulContext.pegawaiId,
          jenisLayananId,
          actionCode: String(actionCodeRaw),
          actorRoleId,
          actorUserId: user?.id
            ? BigInt(String(user.id))
            : undefined,
        }),
      {
        isolationLevel:
          Prisma.TransactionIsolationLevel.Serializable,
      },
    )
  }

  async resolveJenisLayananId(service: string): Promise<bigint> {
    const jenis =
      await this.prisma.silakapJenisLayanan.findFirst({
        where: { kode: service },
        select: { id: true },
      })

    if (!jenis) {
      throw new BusinessError(
        'LAYANAN_NOT_FOUND',
        'Jenis layanan tidak ditemukan',
      )
    }

    return jenis.id
  }

  async resolveUsulContext(usulId: bigint) {
    const usul =
      await this.prisma.silakapUsulLayanan.findUnique({
        where: { id: usulId },
        select: {
          pegawaiId: true,
          jenisLayananId: true,
        },
      })

    if (!usul) {
      throw new BusinessError(
        'USUL_NOT_FOUND',
        'Usul layanan tidak ditemukan',
      )
    }

    return usul
  }

  async resolveActorRoleId(user: OrchestratorUser): Promise<bigint> {
    const roleName =
      typeof user?.role === 'string' && user.role
        ? user.role
        : Array.isArray(user?.roles) && user.roles.length > 0
          ? user.roles[0]
          : null

    if (!roleName) {
      throw new BusinessError(
        'ROLE_REQUIRED',
        'Role user tidak ditemukan',
      )
    }

    const role = await this.prisma.silakapRole.findFirst({
      where: { name: roleName },
      select: { id: true },
    })

    if (!role) {
      throw new BusinessError(
        'ROLE_NOT_FOUND',
        `Role ${roleName} tidak ditemukan`,
      )
    }

    return role.id
  }

  async normalizeCreateInput(
    service: string,
    body: unknown,
  ): Promise<{
    pegawaiId: bigint
    payload: Record<string, unknown>
  }> {
    const bodyRecord =
      body && typeof body === 'object'
        ? (body as Record<string, unknown>)
        : {}

    const payloadCandidate = bodyRecord.payload

    const normalizedPayload =
      payloadCandidate && typeof payloadCandidate === 'object'
        ? { ...(payloadCandidate as Record<string, unknown>) }
        : { ...bodyRecord }

    let resolvedPegawaiId = bodyRecord.pegawaiId

    if (
      !resolvedPegawaiId &&
      typeof normalizedPayload.nip === 'string'
    ) {
      const pegawai =
        await this.prisma.silakapPegawai.findUnique({
          where: {
            nip: normalizedPayload.nip.trim(),
          },
          select: { id: true },
        })

      if (!pegawai) {
        throw new BusinessError(
          'PEGAWAI_NOT_FOUND',
          'Pegawai tidak ditemukan dari NIP',
        )
      }

      resolvedPegawaiId = pegawai.id.toString()
    }

    if (!resolvedPegawaiId) {
      throw new BusinessError(
        'PEGAWAI_REQUIRED',
        'pegawaiId tidak boleh kosong',
      )
    }

    if (
      service.toUpperCase() === 'PENSIUN' &&
      !normalizedPayload.jenisPensiunId &&
      typeof normalizedPayload.jenisPensiun === 'string'
    ) {
      const jenisPensiun =
        await this.prisma.refJenisPensiun.findFirst({
          where: {
            kode: normalizedPayload.jenisPensiun
              .trim()
              .toUpperCase(),
            deletedAt: null,
          },
          select: { id: true },
        })

      if (!jenisPensiun) {
        throw new BusinessError(
          'JENIS_PENSIUN_NOT_FOUND',
          'Jenis pensiun tidak ditemukan',
        )
      }

      normalizedPayload.jenisPensiunId = jenisPensiun.id
    }

    return {
      pegawaiId: BigInt(String(resolvedPegawaiId)),
      payload: normalizedPayload,
    }
  }
}
