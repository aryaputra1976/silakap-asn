import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    const http = context.switchToHttp();
    const request = http.getRequest<Request & { user?: any }>();

    const method = request.method;
    const url = (request as any).url;
    const ip = (request as any).ip;
    const userAgent = (request as any).headers['user-agent'];
    const user = request.user ? request.user.id || request.user.email : null;

    // Log request masuk
    this.logger.log(
      `➡️  ${method} ${url} | ip=${ip} | agent=${userAgent} ${
        user ? `| user=${user}` : ''
      }`,
    );

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - now;

        // Log response keluar
        this.logger.log(
          `⬅️  ${method} ${url} | ${ms}ms ${
            user ? `| user=${user}` : ''
          }`,
        );
      }),
    );
  }
}
