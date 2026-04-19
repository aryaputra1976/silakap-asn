import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable, map } from 'rxjs'
import { Request } from 'express'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp()
    const request = http.getRequest<Request>()

    return next.handle().pipe(
      map((body) => {
        // ================= SKIP STREAM / FILE =================
        if (
          body instanceof Buffer ||
          (body && typeof body === 'object' && ('pipe' in body || 'isRawResponse' in body))
        ) {
          return body
        }

        // ================= HANDLE PAGINATION =================
        if (body && typeof body === 'object' && 'data' in body && 'meta' in body) {
          return {
            success: true,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            data: body.data,
            meta: body.meta,
          }
        }

        // ================= DEFAULT SUCCESS =================
        return {
          success: true,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          data: body ?? null,
        }
      }),
    )
  }
}