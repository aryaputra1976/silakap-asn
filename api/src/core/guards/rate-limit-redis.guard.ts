import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { TooManyRequestsException } from '../exceptions';

const WINDOW_SECONDS = 60; // 1 menit
const MAX_IP_HITS = 100;
const MAX_USER_HITS = 60;

@Injectable()
export class RateLimitRedisGuard implements CanActivate {
  constructor(private redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const ip = (req.ip || req.connection?.remoteAddress || '').toString();
    const userId = req.user?.id ? String(req.user.id) : null;

    const client = this.redis.getClient();

    // IP key
    const ipKey = `rate:ip:${ip}`;
    const ipHits = await client.incr(ipKey);

    if (ipHits === 1) {
      await client.expire(ipKey, WINDOW_SECONDS);
    }

    if (ipHits > MAX_IP_HITS) {
      throw new TooManyRequestsException('Too many requests from this IP');
    }

    // User key
    if (userId) {
      const userKey = `rate:user:${userId}`;
      const userHits = await client.incr(userKey);

      if (userHits === 1) {
        await client.expire(userKey, WINDOW_SECONDS);
      }

      if (userHits > MAX_USER_HITS) {
        throw new TooManyRequestsException('Too many requests for this user');
      }
    }

    return true;
  }
}
