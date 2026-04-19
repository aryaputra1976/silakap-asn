import { Controller, Get, Query, Req } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'

@Controller('security/audit')
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Req() req: any, @Query() query: any) {
    const page = Number(query.page ?? 1)
    const limit = Number(query.limit ?? 20)

    const where: any = {}

    if (query.userId) {
      where.userId = BigInt(query.userId)
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ])

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
}
