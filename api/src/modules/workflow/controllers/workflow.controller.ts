import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"

import { WorkflowQueryService } from "../service/workflow.query.service"
import { WorkflowTimelineService } from "../service/workflow.timeline.service"

const prisma = new PrismaClient()

export class WorkflowController {

  async status(req: Request, res: Response) {

    try {

      const usulId = BigInt(req.params.id)

      const data = await WorkflowQueryService.getStatus(
        prisma,
        usulId
      )

      return res.json(data)

    } catch (err) {

      const error = err as Error

      return res.status(500).json({
        message: error.message
      })

    }

  }

  async timeline(req: Request, res: Response) {

    try {

      const usulId = BigInt(req.params.id)

      const data = await WorkflowTimelineService.getTimeline(
        prisma,
        usulId
      )

      return res.json(data)

    } catch (err) {

      const error = err as Error

      return res.status(500).json({
        message: error.message
      })

    }

  }

}