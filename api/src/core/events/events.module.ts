import { Module } from '@nestjs/common'
import { OutboxModule } from '../outbox/outbox.module'
import { DomainEventBus } from './domain-event.bus'

@Module({
  imports: [OutboxModule],   // ⬅️ WAJIB
  providers: [DomainEventBus],
  exports: [DomainEventBus],
})
export class EventsModule {}