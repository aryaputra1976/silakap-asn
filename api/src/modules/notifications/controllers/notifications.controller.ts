import { Request, Response } from 'express'

import { NotificationsService } from '../service/notifications.service'
import { NotificationsQueryService } from '../service/notifications.query.service'

const service = new NotificationsService()
const queryService = new NotificationsQueryService()

export class NotificationsController {

  async list(req: Request, res: Response) {

    const result = await queryService.list(
      BigInt(req.params.userId)
    )

    res.json(result)

  }

  async unread(req: Request, res: Response) {

    const result = await queryService.unreadCount(
      BigInt(req.params.userId)
    )

    res.json({
      unread: result
    })

  }

  async markRead(req: Request, res: Response) {

    const result = await service.markAsRead(
      BigInt(req.params.id)
    )

    res.json(result)

  }

}
