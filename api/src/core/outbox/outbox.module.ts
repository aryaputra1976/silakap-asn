import { Module } from '@nestjs/common'
import { PrismaModule } from '@/prisma/prisma.module'
import { QueueModule } from '@/core/queue/queue.module'
import { OutboxPublisher } from './outbox.publisher'
import { OutboxProcessor } from './outbox.processor'
import { OutboxWorker } from './outbox.worker'

@Module({
  imports: [PrismaModule, QueueModule],
  providers: [
    OutboxPublisher,
    OutboxProcessor,
    OutboxWorker,
  ],
  exports: [OutboxPublisher],
})
export class OutboxModule {}