import { Router } from "express"
import { WorkflowController } from "../controllers/workflow.controller"

const router = Router()
const controller = new WorkflowController()

/**
 * Get status layanan
 */
router.get(
  "/status/:id",
  (req, res, next) =>
    controller.status(req, res).catch(next)
)

/**
 * Get timeline layanan
 */
router.get(
  "/timeline/:id",
  (req, res, next) =>
    controller.timeline(req, res).catch(next)
)

export default router