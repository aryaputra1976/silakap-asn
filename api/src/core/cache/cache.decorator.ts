import { SetMetadata } from '@nestjs/common';
import { CACHE_KEY, CACHE_TTL } from './cache.interceptor';

export const CacheKey = (key: string) => SetMetadata(CACHE_KEY, key);
export const CacheTTL = (seconds: number) => SetMetadata(CACHE_TTL, seconds);
