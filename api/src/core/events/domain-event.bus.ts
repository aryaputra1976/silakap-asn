import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { OutboxPublisher } from '../outbox/outbox.publisher'
import { DomainEvent } from './domain-event.interface'

type EventHandler = (event: DomainEvent<any>) => void

@Injectable()
export class DomainEventBus {
  private handlers: Map<string, EventHandler[]> = new Map()

  constructor(
    private readonly outboxPublisher: OutboxPublisher,
  ) {}

  // =========================
  // SUBSCRIBE (IN-MEMORY)
  // =========================
  subscribe(eventType: string, handler: EventHandler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, [])
    }

    this.handlers.get(eventType)!.push(handler)
  }

  // =========================
  // PUBLISH
  // =========================
  async publish<
    T extends Prisma.InputJsonValue = Prisma.InputJsonValue,
  >(event: DomainEvent<T>) {
    // 1️⃣ in-memory listeners
    const listeners = this.handlers.get(event.eventType)
    if (listeners) {
      for (const handler of listeners) {
        handler(event)
      }
    }

    // 2️⃣ persist ke outbox
    await this.outboxPublisher.publish(event)
  }
}