import { Worker } from 'bullmq';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../../prisma/prisma.service'

export const createAuditProcessor = (
  redis: RedisService,
  prisma: PrismaService,
) => {
  return new Worker(
    'audit',
    async (job) => {
      await prisma.auditLog.create({
        data: job.data,
      });
    },
    {
      connection: redis.getClient().options,
    },
  );
};
