import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP-Middleware');

  use(req: Request & { user?: any }, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.headers['user-agent'];
    const user = req.user ? req.user.id || req.user.email : null;

    this.logger.log(
      `➡️  ${method} ${originalUrl} | ip=${ip} | agent=${userAgent} ${
        user ? `| user=${user}` : ''
      }`,
    );

    next();
  }
}
