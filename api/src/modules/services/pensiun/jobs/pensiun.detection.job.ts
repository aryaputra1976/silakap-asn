import { prisma } from "@/core/prisma/prisma.client"
import { PensiunDetectionService } from "../domain/services/pensiun.detection.service"

const detectionService = new PensiunDetectionService()

export async function runPensiunDetectionJob() {

  try {

    const hasil =
      await detectionService.scanCalonPensiun(prisma)

    console.log(
      "[PENSIUN JOB] Calon pensiun ditemukan:",
      hasil.length
    )

  } catch (err) {

    const message =
      err instanceof Error
        ? err.message
        : "Pensiun detection job error"

    console.error("[PENSIUN JOB ERROR]", message)

  }

}