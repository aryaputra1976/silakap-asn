import { Request, Response } from "express"
import { prisma } from "@/core/prisma/prisma.client"
import { CompletenessService } from "../completeness.service"

const service = new CompletenessService()

export class CompletenessController {

  async calculate(req: Request, res: Response) {

    try {

      const pegawaiId = BigInt(req.params.pegawaiId)
      const layananId = BigInt(req.params.layananId)

      const result =
        await prisma.$transaction(tx =>
          service.calculateByPegawai(
            tx,
            pegawaiId,
            layananId
          )
        )

      res.json(result)

    } catch (err) {

      const error = err as Error

      res.status(500).json({
        message: error.message
      })

    }

  }

  async status(req: Request, res: Response) {

    try {

      const pegawaiId = BigInt(req.params.pegawaiId)
      const layananId = BigInt(req.params.layananId)

      const data =
        await service.getStatus(
          prisma,
          pegawaiId,
          layananId
        )

      res.json(data)

    } catch (err) {

      const error = err as Error

      res.status(500).json({
        message: error.message
      })

    }

  }

}