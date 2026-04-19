// src/modules/auth/strategies/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

/**
 * JWT Payload structure (token content)
 * Ini merepresentasikan isi JWT yang ditandatangani saat login.
 */
export interface JwtPayload {
  sub: string
  id: string
  name: string

  // backward compatibility
  role?: string | null

  // primary multi-role
  roles?: string[]

  unitKerjaId?: string | null
  bidangId?: string | null
  opd?: string | null

  permissions?: string[]
}

/**
 * Object yang akan tersedia sebagai request.user
 * setelah token divalidasi oleh Passport.
 */
export interface AuthenticatedUser {
  id: bigint
  name: string
  role: string | null
  roles: string[]
  unitKerjaId: string | null
  bidangId: string | null
  opd: string | null
  permissions: string[]
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET')

    if (!secret) {
      throw new Error('JWT_SECRET is missing')
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    })
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload?.id) {
      throw new UnauthorizedException('Invalid token payload')
    }

    return {
      // 🔥 Internal system pakai BigInt
      id: BigInt(payload.id),

      name: payload.name,

      // legacy support
      role: payload.role ?? null,

      // multi-role primary
      roles: payload.roles ?? [],

      unitKerjaId: payload.unitKerjaId ?? null,
      bidangId: payload.bidangId ?? null,
      opd: payload.opd ?? null,

      permissions: payload.permissions ?? [],
    }
  }
}