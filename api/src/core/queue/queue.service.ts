import {
  Injectable,
  OnModuleDestroy,
} from '@nestjs/common'
import { Queue, Worker, JobsOptions } from 'bullmq'
import { RedisService } from '../redis/redis.service'

@Injectable()
export class QueueService implements OnModuleDestroy {
  private queues: Map<string, Queue> = new Map()
  private workers: Worker[] = []

  constructor(private readonly redis: RedisService) {}

  // =====================================================
  // CREATE OR GET QUEUE (Singleton per name)
  // =====================================================
  createQueue(name: string) {
    return this.getQueue(name)
  }
  
  getQueue(name: string): Queue {
    if (this.queues.has(name)) {
      return this.queues.get(name)!
    }

    const client = this.redis.getClient()

    if (!client) {
      throw new Error('Redis client is not initialized')
    }

    const queue = new Queue(name, {
      connection: client.options,
    })

    this.queues.set(name, queue)

    return queue
  }

  // =====================================================
  // ADD JOB TO QUEUE (ENTERPRISE SAFE)
  // =====================================================

  async add(
    queueName: string,
    jobName: string,
    data: any,
    options?: JobsOptions,
  ) {
    const queue = this.getQueue(queueName)

    return queue.add(jobName, data, {
      removeOnComplete: true,
      removeOnFail: false,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      ...options,
    })
  }

  // =====================================================
  // REGISTER WORKER
  // =====================================================

  registerWorker(worker: Worker) {
    this.workers.push(worker)
  }

  // =====================================================
  // CLEAN SHUTDOWN
  // =====================================================

  async onModuleDestroy() {
    for (const worker of this.workers) {
      await worker.close()
    }

    for (const queue of this.queues.values()) {
      await queue.close()
    }
  }
}