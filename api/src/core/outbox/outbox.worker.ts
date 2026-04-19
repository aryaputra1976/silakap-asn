import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { OutboxProcessor } from './outbox.processor'

@Injectable()
export class OutboxWorker implements OnModuleInit {
  private readonly logger = new Logger(OutboxWorker.name)

  constructor(private readonly processor: OutboxProcessor) {}

  async onModuleInit() {
    // Jalankan sekali saat startup
    await this.safeProcess()

    // Polling tiap 2 jam
    setInterval(async () => {
      await this.safeProcess()
    }, 1000 * 60 * 60 * 2) // 2 jam
  }

  private async safeProcess() {
    try {
      await this.processor.processBatch()
    } catch (err) {
      this.logger.error('Outbox batch failed', err as any)
    }
  }
}