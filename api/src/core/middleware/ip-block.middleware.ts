import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';

const BLOCKED_IPS = new Set<string>([
  // '1.2.3.4',
]);

@Injectable()
export class IpBlockMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const ip =
      req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'];

    if (ip && BLOCKED_IPS.has(String(ip))) {
      throw new ForbiddenException('Your IP is blocked');
    }

    next();
  }
}
