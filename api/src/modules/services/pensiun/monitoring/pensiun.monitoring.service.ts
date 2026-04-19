import { PrismaClient } from "@prisma/client"
import { BusinessError } from "@/core/errors/business.error"

export class PensiunMonitorService {

  async summary(prisma: PrismaClient) {

    if (!prisma) {
      throw new BusinessError(
        "PRISMA_REQUIRED",
        "Prisma client tidak tersedia"
      )
    }

    const [total, calculated] = await Promise.all([

      prisma.silakapPensiunDetail.count(),

      prisma.silakapPensiunPerhitungan.count()

    ])

    return {
      total,
      calculated,
      notCalculated: Math.max(total - calculated, 0)
    }

  }

}