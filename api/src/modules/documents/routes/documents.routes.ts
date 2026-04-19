import { Router } from 'express'
import { DocumentsController } from '../controllers/documents.controller'

const router = Router()
const controller = new DocumentsController()

router.post('/upload', controller.upload.bind(controller))
router.get('/usul/:usulId', controller.list.bind(controller))
router.delete('/:id', controller.delete.bind(controller))

export default router
