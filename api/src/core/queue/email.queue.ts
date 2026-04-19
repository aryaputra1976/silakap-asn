import { Injectable } from '@nestjs/common';
import { QueueService } from './queue.service';

@Injectable()
export class EmailQueue {
  private queue;

  constructor(queueService: QueueService) {
    this.queue = queueService.createQueue('email');
  }

  async sendEmail(data: { to: string; subject: string; body: string }) {
    await this.queue.add('send-email', data, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 3000 },
    });
  }
}
