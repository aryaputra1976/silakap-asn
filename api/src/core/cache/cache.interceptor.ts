import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from './cache.service';
import { Reflector } from '@nestjs/core';

export const CACHE_KEY = 'cache_key';
export const CACHE_TTL = 'cache_ttl';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private cache: CacheService,
    private reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    const key =
      this.reflector.get<string>(CACHE_KEY, context.getHandler()) ||
      `cache:${req.method}:${req.url}`;

    const ttl =
      this.reflector.get<number>(CACHE_TTL, context.getHandler()) || 60;

    const cached = await this.cache.get(key);
    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      tap((data) => {
        this.cache.set(key, data, ttl);
      }),
    );
  }
}
