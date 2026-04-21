import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { NestExpressApplication } from '@nestjs/platform-express'
import { NextFunction, Request, Response } from 'express'

import { AppModule } from './app.module'
import { setupSwagger } from './config/swagger.config'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  const config = app.get(ConfigService)

  const appEnv =
    config.get<'development' | 'production' | 'test'>('APP_ENV') ??
    'development'

  const trustProxy = config.get<number>('APP_TRUST_PROXY') ?? 1
  const forceHttps = config.get<boolean>('FORCE_HTTPS') ?? false
  const enableSwagger =
    config.get<boolean>('ENABLE_SWAGGER') ?? appEnv !== 'production'

  app.enableShutdownHooks()

  app.use(
    helmet({
      hsts:
        appEnv === 'production'
          ? {
              maxAge: 31536000,
              includeSubDomains: true,
              preload: true,
            }
          : false,
    }),
  )

  app.use(cookieParser())

  app.set('trust proxy', trustProxy)

  app.setGlobalPrefix('api')

  const allowedOrigins =
    config
      .get<string>('CORS_ORIGIN')
      ?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? []

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  if (forceHttps) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      // ✅ Jangan blok preflight
      if (req.method === 'OPTIONS') {
        return next()
      }

      const forwardedProto = req.headers['x-forwarded-proto']

      const isHttps =
        req.secure ||
        forwardedProto === 'https' ||
        (Array.isArray(forwardedProto) &&
          forwardedProto.includes('https'))

      if (!isHttps) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: 'HTTPS is required',
          path: req.url,
          method: req.method,
          timestamp: new Date().toISOString(),
        })
      }

      next()
    })
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  if (enableSwagger) {
    setupSwagger(app)
  }

  // ✅ fallback ke PORT (penting untuk Hostinger / platform)
  const port =
    config.get<number>('APP_PORT') ||
    Number(process.env.PORT) ||
    3000

  await app.listen(port, '0.0.0.0')

  const serverUrl = await app.getUrl()
  console.log(`API running on ${serverUrl}/api`)
}

bootstrap()