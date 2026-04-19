import { Router } from "express"
import { CompletenessController } from "../controllers/completeness.controller"

const router = Router()
const controller = new CompletenessController()

/**
 * hitung ulang kelengkapan dokumen
 */
router.post(
  "/pegawai/:pegawaiId/layanan/:layananId/calculate",
  controller.calculate
)

/**
 * ambil status kelengkapan
 */
router.get(
  "/pegawai/:pegawaiId/layanan/:layananId/status",
  controller.status
)

export default router