import { Worker } from 'bullmq';
import { RedisService } from '../redis/redis.service';

export const createNotificationProcessor = (redis: RedisService) => {
  return new Worker(
    'notification',
    async (job) => {
      console.log('Sending notification:', job.data);
    },
    {
      connection: redis.getClient().options,
    },
  );
};
