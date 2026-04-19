import { Router } from 'express'
import { ServicesController } from '../controllers/services.controller'

const router = Router()
const controller = new ServicesController()

const create = controller.create.bind(controller)
const submit = controller.submit.bind(controller)
const workflow = controller.workflow.bind(controller)
const getById = controller.getById.bind(controller)
const list = controller.list.bind(controller)
const dashboard = controller.dashboard.bind(controller)

/**
 * Dashboard layanan
 */
router.get('/:service/dashboard', dashboard)

/**
 * Detail layanan
 */
router.get('/:service/:id', getById)

/**
 * List layanan
 */
router.get('/:service', list)

/**
 * Create layanan
 */
router.post('/:service', create)

/**
 * Submit layanan
 */
router.post('/:service/submit', submit)

/**
 * Workflow action
 */
router.post('/:service/workflow', workflow)

export default router