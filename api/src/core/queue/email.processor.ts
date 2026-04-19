import { Worker } from 'bullmq';
import { RedisService } from '../redis/redis.service';

export const createEmailProcessor = (redis: RedisService) => {
  return new Worker(
    'email',
    async (job) => {
      const { to, subject, body } = job.data;

      // TODO: Integrasi email provider
      console.log(`Sending email to ${to}: ${subject}`);
    },
    {
      connection: redis.getClient().options,
    },
  );
};
