import { Request, Response } from 'express'

export class DataUpdateController {

  async create(req: Request, res: Response) {

    res.json({
      message: 'Usul peremajaan data dibuat'
    })

  }

}