import { Request, Response } from "express"

import { prisma } from "@/core/prisma/prisma.client"
import { PrismaService } from "@/prisma/prisma.service"
import { normalizeBigInt } from "@/utils/normalizeBigInt"

import { CompletenessService } from "../../completeness/completeness.service"
import { ServicesEngine } from "../../orchestrator/services.engine"
import { ServicesDependencyService } from "../../orchestrator/service/services.dependency.service"
import { ServicesWorkflowGuard } from "../../orchestrator/service/services.workflow.guard"
import { ServicesWorkflowService } from "../../orchestrator/service/services.workflow.service"

import { PensiunQueryService } from "../query/pensiun.query.service"
import { PensiunMonitorService } from "../monitoring/pensiun.monitoring.service"
import { PensiunProjectionService } from "../domain/services/pensiun.projection.service"
import { PensiunDPCPService } from "../domain/services/pensiun.dpcp.service"

const servicesEngine = new ServicesEngine(
  new PrismaService(),
  new ServicesWorkflowService(),
  new ServicesDependencyService(),
  new ServicesWorkflowGuard(),
  new CompletenessService()
)

const queryService = new PensiunQueryService()
const monitoringService = new PensiunMonitorService()
const projectionService = new PensiunProjectionService()
const dpcpService = new PensiunDPCPService()

function parseBigInt(value: any, name: string): bigint {
  if (value === undefined || value === null) {
    throw new Error(`${name} tidak boleh kosong`)
  }

  try {
    return BigInt(value)
  } catch {
    throw new Error(`${name} harus berupa angka`)
  }
}

function sendJSON(res: Response, data: any) {
  return res.json(normalizeBigInt(data))
}

function handleError(res: Response, error: unknown) {
  const err = error as Error

  return res.status(500).json({
    success: false,
    message: err.message
  })
}

export class PensiunController {

  /**
   * CREATE USUL
   */
  async create(req: Request, res: Response) {

    try {

      const pegawaiId = parseBigInt(req.body.pegawaiId, "pegawaiId")

      const result = await prisma.silakapUsulLayanan.create({
        data: {
          pegawaiId,
          jenisLayananId: BigInt(2), // pensiun
          tanggalUsul: new Date()
        }
      })

      return sendJSON(res, result)

    } catch (error) {
      return handleError(res, error)
    }

  }

  /**
   * CREATE DETAIL PENSIUN
   */
  async createDetail(req: Request, res: Response) {

    try {

      const result = await servicesEngine.createDetail({
        usulId: parseBigInt(req.body.usulId, "usulId"),
        jenisKode: "PENSIUN",
        payload: req.body
      })

      return sendJSON(res, result)

    } catch (error) {
      return handleError(res, error)
    }

  }

  /**
   * SUBMIT USUL
   */
  async submit(req: Request, res: Response) {

    try {

      const result = await prisma.$transaction(async (tx) => {

        return servicesEngine.execute(tx, {
          usulId: parseBigInt(req.body.usulId, "usulId"),
          pegawaiId: parseBigInt(req.body.pegawaiId, "pegawaiId"),
          jenisLayananId: parseBigInt(req.body.jenisLayananId, "jenisLayananId"),
          actionCode: "SUBMIT",
          actorRoleId: req.body.actorRoleId
            ? BigInt(req.body.actorRoleId)
            : undefined
        })

      })

      return sendJSON(res, result)

    } catch (error) {
      return handleError(res, error)
    }

  }

  /**
   * APPROVE
   */
  async approve(req: Request, res: Response) {

    try {

      const result = await prisma.$transaction(async (tx) => {

        return servicesEngine.execute(tx, {
          usulId: parseBigInt(req.body.usulId, "usulId"),
          pegawaiId: parseBigInt(req.body.pegawaiId, "pegawaiId"),
          jenisLayananId: parseBigInt(req.body.jenisLayananId, "jenisLayananId"),
          actionCode: "APPROVE",
          actorRoleId: req.body.actorRoleId
            ? BigInt(req.body.actorRoleId)
            : undefined
        })

      })

      return sendJSON(res, result)

    } catch (error) {
      return handleError(res, error)
    }

  }

  /**
   * REJECT
   */
  async reject(req: Request, res: Response) {

    try {

      const result = await prisma.$transaction(async (tx) => {

        return servicesEngine.execute(tx, {
          usulId: parseBigInt(req.body.usulId, "usulId"),
          pegawaiId: parseBigInt(req.body.pegawaiId, "pegawaiId"),
          jenisLayananId: parseBigInt(req.body.jenisLayananId, "jenisLayananId"),
          actionCode: "REJECT",
          actorRoleId: req.body.actorRoleId
            ? BigInt(req.body.actorRoleId)
            : undefined
        })

      })

      return sendJSON(res, result)

    } catch (error) {
      return handleError(res, error)
    }

  }

  async detail(req: Request, res: Response) {

    try {

      const id = parseBigInt(req.params.id, "id")

      const result = await queryService.getDetail(
        prisma,
        id
      )

      return sendJSON(res, result)

    } catch (error) {
      return handleError(res, error)
    }

  }

  async list(req: Request, res: Response) {

    try {

      const result = await queryService.list(
        prisma,
        req.query
      )

      return sendJSON(res, result)

    } catch (error) {
      return handleError(res, error)
    }

  }

  async calonPensiun(req: Request, res: Response) {

    try {

      const golonganId = parseBigInt(req.query.golonganId, "golonganId")

      const tmtPns = new Date(req.query.tmtPns as string)
      const tmtPensiun = new Date(req.query.tmtPensiun as string)

      const result = await projectionService.project(
        prisma,
        golonganId,
        tmtPns,
        tmtPensiun
      )

      return sendJSON(res, result)

    } catch (error) {
      return handleError(res, error)
    }

  }

  async dpcp(req: Request, res: Response) {

    try {

      const pensiunId = parseBigInt(req.params.id, "pensiunId")

      const data = await dpcpService.generate(
        prisma,
        pensiunId
      )

      return sendJSON(res, data)

    } catch (error) {
      return handleError(res, error)
    }

  }

}

export async function getPensiunStatistik(
  _req: Request,
  res: Response
) {

  try {

    const data = await monitoringService.summary(
      prisma
    )

    return res.json(normalizeBigInt(data))

  } catch (error) {
    return handleError(res, error)
  }

}
