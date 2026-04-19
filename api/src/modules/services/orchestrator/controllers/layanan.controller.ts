import { Controller, Get } from '@nestjs/common'
import { LayananStatus } from '@prisma/client'

import { prisma } from '@/core/prisma/prisma.client'
import { Public } from '@/core/decorators/public.decorator'

@Controller('layanan')
export class LayananController {
  @Public()
  @Get('badge')
  async badge() {
    const grouped = await prisma.silakapUsulLayanan.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    const counts = grouped.reduce<Record<string, number>>((acc, row) => {
      acc[row.status] = row._count.id
      return acc
    }, {})

    return {
      total: grouped.reduce((sum, row) => sum + row._count.id, 0),
      draft: counts[LayananStatus.DRAFT] ?? 0,
      submitted: counts[LayananStatus.SUBMITTED] ?? 0,
      verified: counts[LayananStatus.VERIFIED] ?? 0,
      returned: counts[LayananStatus.RETURNED] ?? 0,
      approved: counts[LayananStatus.APPROVED] ?? 0,
      rejected: counts[LayananStatus.REJECTED] ?? 0,
      syncedSiasn: counts[LayananStatus.SYNCED_SIASN] ?? 0,
      failedSiasn: counts[LayananStatus.FAILED_SIASN] ?? 0,
      byStatus: counts,
    }
  }
}
