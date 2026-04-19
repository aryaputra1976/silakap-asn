import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { TooManyRequestsException } from '../exceptions';

type HitRecord = {
  count: number;
  firstHit: number;
};

const IP_HITS = new Map<string, HitRecord>();
const USER_HITS = new Map<string, HitRecord>();

const WINDOW_MS = 60_000; // 1 menit
const MAX_IP_HITS = 100; // per IP per menit
const MAX_USER_HITS = 60; // per user per menit

@Injectable()
export class RateLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const ip = (req.ip || req.connection?.remoteAddress || '').toString();
    const userId = req.user?.id ? String(req.user.id) : null;

    const now = Date.now();

    // IP based
    const ipRecord = IP_HITS.get(ip) || { count: 0, firstHit: now };
    if (now - ipRecord.firstHit > WINDOW_MS) {
      ipRecord.count = 0;
      ipRecord.firstHit = now;
    }
    ipRecord.count++;
    IP_HITS.set(ip, ipRecord);

    if (ipRecord.count > MAX_IP_HITS) {
      throw new TooManyRequestsException('Too many requests from this IP');
    }

    // User based (kalau sudah login)
    if (userId) {
      const userRecord = USER_HITS.get(userId) || {
        count: 0,
        firstHit: now,
      };

      if (now - userRecord.firstHit > WINDOW_MS) {
        userRecord.count = 0;
        userRecord.firstHit = now;
      }

      userRecord.count++;
      USER_HITS.set(userId, userRecord);

      if (userRecord.count > MAX_USER_HITS) {
        throw new TooManyRequestsException('Too many requests for this user');
      }
    }

    return true;
  }
}
