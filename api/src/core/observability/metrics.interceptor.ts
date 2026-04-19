import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const path = req.route?.path || req.url;

    const end = this.metrics.httpRequestDuration.startTimer({
      method,
      path,
    });

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const status = res.statusCode.toString();

          this.metrics.httpRequestCounter.inc({ method, path, status });
          end({ status });
        },
        error: () => {
          const res = context.switchToHttp().getResponse();
          const status = res.statusCode?.toString() || '500';

          this.metrics.httpRequestCounter.inc({ method, path, status });
          end({ status });
        },
      }),
    );
  }
}
