import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { JwtStrategy } from './strategies/jwt.strategy'
import { RedisModule } from '../../core/redis/redis.module'
import { SecurityModule } from '../../core/security/security.module'
import { RbacModule } from '../../modules/rbac/rbac.module'

@Module({
  imports: [
    ConfigModule,
    RedisModule,
    /**
     * ================= PASSPORT =================
     * Default strategy JWT
     */
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),

    /**
     * ================= JWT =================
     * Async config from ENV
     */
      JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          const secret = config.get<string>('JWT_SECRET')

          if (!secret) {
            throw new Error('JWT_SECRET is not defined in environment')
          }

          const expiresIn =
            config.get<string>('JWT_EXPIRES_IN') ?? '15m'

          return {
            secret,
            signOptions: {
              expiresIn: expiresIn as any, // ← aman & umum dipakai
            },
          }
        },
      }),

    /**
     * ================= CORE DEPENDENCIES =================
     */
    SecurityModule,
    RbacModule,
  ],

  controllers: [AuthController],

  providers: [
    /**
     * ================= SERVICES =================
     */
    AuthService,
    JwtStrategy,

    /**
     * ================= GLOBAL JWT GUARD =================
     * Semua endpoint default protected,
     * kecuali yang pakai @Public()
     */
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],

  /**
   * Export hanya yang benar-benar dibutuhkan
   */
  exports: [
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {}