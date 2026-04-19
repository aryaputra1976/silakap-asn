import { Router } from 'express'
import { DataUpdateController } from '../controllers/data-update.controller'

const router = Router()
const controller = new DataUpdateController()

router.post('/', controller.create)

export default router