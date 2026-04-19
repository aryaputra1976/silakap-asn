import { Request, Response } from 'express'

import { DocumentsService } from '../service/documents.service'
import { DocumentsQueryService } from '../service/documents.query.service'

const service = new DocumentsService()
const queryService = new DocumentsQueryService()

export class DocumentsController {

  async upload(req: Request, res: Response) {

    const { usulId, jenisId, nama, filePath } = req.body

    const result = await service.upload(
      BigInt(usulId),
      BigInt(jenisId),
      nama,
      filePath
    )

    res.json(result)

  }

  async list(req: Request, res: Response) {

    const result = await queryService.listByUsul(
      BigInt(req.params.usulId)
    )

    res.json(result)

  }

  async delete(req: Request, res: Response) {

    const result = await service.delete(
      BigInt(req.params.id)
    )

    res.json(result)

  }

}
