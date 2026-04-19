import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { DomainEvent } from '../events/domain-event.interface'

@Injectable()
export class OutboxPublisher {
  constructor(private prisma: PrismaService) {}

  async publish(event: DomainEvent) {
    await this.prisma.outbox.create({
      data: {
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        payload: event.payload, // now type-safe
        status: 'PENDING',
        createdAt: event.occurredAt,
      },
    })
  }
}