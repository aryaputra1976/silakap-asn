import { Injectable } from "@nestjs/common"

interface CacheItem {
  value: any
  expiresAt: number
}

@Injectable()
export class StatisticsCacheService {

  private cache = new Map<string, CacheItem>()

  private DEFAULT_TTL = 60 * 1000 // 1 menit

  get(key: string) {
    const item = this.cache.get(key)

    if (!item) return null

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  set(key: string, value: any, ttl?: number) {

    const expiresAt = Date.now() + (ttl ?? this.DEFAULT_TTL)

    this.cache.set(key, {
      value,
      expiresAt
    })
  }

  clear() {
    this.cache.clear()
  }

}