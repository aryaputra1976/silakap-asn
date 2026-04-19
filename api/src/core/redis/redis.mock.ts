import { Injectable } from '@nestjs/common'

@Injectable()
export class MockRedisService {
  async get() {
    return null
  }

  async set() {
    return 'OK'
  }

  async del() {
    return 0
  }

  async ping() {
    return 'PONG'
  }

  async scan() {
    return ['0', []]
  }

  isEnabled() {
    return false
  }

  getClient() {
    return {
      incr: async () => 1,
      expire: async () => null,
      ping: async () => 'PONG',
      get: async () => null,
      set: async () => 'OK',
      del: async () => 0,
      scan: async () => ['0', []],
      options: {},
    }
  }
}
