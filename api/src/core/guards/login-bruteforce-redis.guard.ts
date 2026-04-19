import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { TooManyRequestsException } from '../exceptions';

const WINDOW_SECONDS = 300; // 5 menit
const MAX_ATTEMPTS = 10;

@Injectable()
export class LoginBruteforceRedisGuard implements CanActivate {
  constructor(private redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const ip = (req.ip || req.connection?.remoteAddress || '').toString();

    const client = this.redis.getClient();
    const key = `login:ip:${ip}`;

    const attempts = await client.incr(key);

    if (attempts === 1) {
      await client.expire(key, WINDOW_SECONDS);
    }

    if (attempts > MAX_ATTEMPTS) {
      throw new TooManyRequestsException(
        'Too many login attempts, please try again later',
      );
    }

    return true;
  }
}
