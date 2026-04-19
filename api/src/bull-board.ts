import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { QueueService } from './core/queue/queue.service';

export const setupBullBoard = (app: any, queueService: QueueService) => {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/queues');

  const emailQueue = queueService.createQueue('email');
  const auditQueue = queueService.createQueue('audit');
  const notificationQueue = queueService.createQueue('notification');

  createBullBoard({
    queues: [
      new BullMQAdapter(emailQueue),
      new BullMQAdapter(auditQueue),
      new BullMQAdapter(notificationQueue),
    ],
    serverAdapter,
  });

  app.use('/queues', serverAdapter.getRouter());
};
