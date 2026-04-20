import { Router } from 'express'
import { PrismaService } from '@/prisma/prisma.service'
import { CompletenessService } from '../../completeness/completeness.service'
import { ServicesController } from '../controllers/services.controller'
import { ServicesEngine } from '../services.engine'
import { ServicesDashboardService } from '../service/services.dashboard.service'
import { ServicesDependencyService } from '../service/services.dependency.service'
import { ServicesQueryService } from '../service/services.query.service'
import { ServicesService } from '../service/services.service'
import { ServicesWorkflowGuard } from '../service/services.workflow.guard'
import { ServicesWorkflowService } from '../service/services.workflow.service'

const router = Router()
const prisma = new PrismaService()
const completenessService = new CompletenessService()
const workflowService = new ServicesWorkflowService()
const dependencyService = new ServicesDependencyService()
const workflowGuard = new ServicesWorkflowGuard()
const engine = new ServicesEngine(
  prisma,
  workflowService,
  dependencyService,
  workflowGuard,
  completenessService,
)
const servicesService = new ServicesService(prisma, engine)
const queryService = new ServicesQueryService(prisma)
const dashboardService = new ServicesDashboardService(prisma)
const controller = new ServicesController(
  servicesService,
  queryService,
  dashboardService,
)

/**
 * Dashboard layanan
 */
router.get('/:service/dashboard', (req, res, next) => {
  controller
    .dashboard(req.params.service)
    .then((result) => res.json(result))
    .catch(next)
})

/**
 * Detail layanan
 */
router.get('/:service/:id', (req, res, next) => {
  controller
    .getById(req.params.id)
    .then((result) => res.json(result))
    .catch(next)
})

/**
 * List layanan
 */
router.get('/:service', (req, res, next) => {
  controller
    .list(req.params.service)
    .then((result) => res.json(result))
    .catch(next)
})

/**
 * Create layanan
 */
router.post('/:service', (req, res, next) => {
  controller
    .create(req.params.service, req.body)
    .then((result) => res.json(result))
    .catch(next)
})

/**
 * Submit layanan
 */
router.post('/:service/submit', (req, res, next) => {
  controller
    .submit(req.params.service, req.body, req)
    .then((result) => res.json(result))
    .catch(next)
})

/**
 * Workflow action
 */
router.post('/:service/workflow', (req, res, next) => {
  controller
    .workflow(req.params.service, req.body, req)
    .then((result) => res.json(result))
    .catch(next)
})

export default router
