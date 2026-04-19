import { Prisma } from '@prisma/client'

export interface DomainEvent<
  T extends Prisma.InputJsonValue = Prisma.InputJsonValue,
> {
  eventType: string
  aggregateType: string
  aggregateId: string
  payload: T
  occurredAt: Date
}