import { Injectable } from '@nestjs/common'
import { QueueService } from './queue.service'

@Injectable()
export class AuditQueue {
  private queue

  constructor(queueService: QueueService) {
    this.queue = queueService.createQueue('audit')
  }

  async log(data: any) {
    await this.queue.add('audit-log', data, {
      attempts: 3,
      // ⚠ JANGAN removeOnComplete → audit harus immutable
    })
  }
}