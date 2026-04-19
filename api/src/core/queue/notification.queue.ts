import { Injectable } from '@nestjs/common';
import { QueueService } from './queue.service';

@Injectable()
export class NotificationQueue {
  private queue;

  constructor(queueService: QueueService) {
    this.queue = queueService.createQueue('notification');
  }

  async push(data: any) {
    await this.queue.add('notify', data, {
      attempts: 3,
    });
  }
}
