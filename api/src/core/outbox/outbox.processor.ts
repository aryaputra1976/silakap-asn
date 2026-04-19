import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { QueueService } from '../queue/queue.service'

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  async processBatch() {
    const events = await this.prisma.outbox.findMany({
      where: { status: 'PENDING' },
      take: 20,
      orderBy: { createdAt: 'asc' },
    })

    if (!events.length) return

    for (const event of events) {
      try {
        await this.queueService.add(
          'notification',
          event.eventType,
          {
            aggregateType: event.aggregateType,
            aggregateId: event.aggregateId,
            payload: event.payload,
            occurredAt: event.createdAt,
          },
        )

        await this.prisma.outbox.update({
          where: { id: event.id },
          data: {
            status: 'PROCESSED',
            processedAt: new Date(),
          },
        })
      } catch (error) {
        this.logger.error(
          `Failed processing outbox event ${event.id}`,
          error as any,
        )

        await this.prisma.outbox.update({
          where: { id: event.id },
          data: {
            retryCount: { increment: 1 },
          },
        })
      }
    }
  }
}