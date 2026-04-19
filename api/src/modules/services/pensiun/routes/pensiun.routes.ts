import { Router } from "express"

import {
  getPensiunStatistik,
  PensiunController
} from "../controllers/pensiun.controller"

const router = Router()
const controller = new PensiunController()

/**
 * CREATE
 */
router.post("/", controller.create.bind(controller))
router.post("/detail", controller.createDetail.bind(controller))

/**
 * WORKFLOW
 */
router.post("/submit", controller.submit.bind(controller))
router.post("/approve", controller.approve.bind(controller))
router.post("/reject", controller.reject.bind(controller))

/**
 * QUERY
 */
router.get("/", controller.list.bind(controller))
router.get("/statistik", getPensiunStatistik)
router.get("/calon", controller.calonPensiun.bind(controller))
router.get("/dpcp/:id", controller.dpcp.bind(controller))

/**
 * DETAIL (HARUS PALING BAWAH)
 */
router.get("/:id", controller.detail.bind(controller))

export default router