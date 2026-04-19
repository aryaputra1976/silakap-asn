import { PrismaClient } from "@prisma/client"
import { SLAEngine } from "../engine/sla.engine"

const prisma = new PrismaClient()

export async function monitorSLA() {

  return prisma.$transaction(async (tx) => {

    /**
     * 1. Detect warning
     */
    const warnings =
      await SLAEngine.detectWarnings(tx, 60)

    if (warnings.length) {

      console.log(
        `[SLA WARNING] ${warnings.length} layanan hampir melewati SLA`
      )

    }

    /**
     * 2. Detect breach
     */
    const breached =
      await SLAEngine.detectBreaches(tx)

    if (breached > 0) {

      console.log(
        `[SLA BREACH] ${breached} layanan melewati SLA`
      )

    }

  })

}