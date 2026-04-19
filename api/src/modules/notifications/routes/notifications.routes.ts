import { Router } from 'express'
import { NotificationsController } from '../controllers/notifications.controller'

const router = Router()
const controller = new NotificationsController()

router.get('/user/:userId', controller.list.bind(controller))
router.get('/unread/:userId', controller.unread.bind(controller))
router.post('/read/:id', controller.markRead.bind(controller))

export default router
