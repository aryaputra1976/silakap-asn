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

 const corsOrigin =
 config.get<string>('CORS_ORIGIN') ?? 'https://silakap.bkpsdm-tolis.or.id'

 app.enableShutdownHooks()
 app.set('trust proxy', trustProxy)

 app.use(
 helmet({
 hsts:
 appEnv === 'production'
 ? { maxAge: 31536000, includeSubDomains: true, preload: true }
 : false,
 }),
 )

 app.use(cookieParser())

 app.enableCors({
 origin: corsOrigin,
 credentials: true,
 methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
 allowedHeaders: ['Content-Type', 'Authorization'],
 })

 app.useGlobalPipes(
 new ValidationPipe({
 whitelist: true,
 transform: true,
 }),
 )

 if (enableSwagger) {
 setupSwagger(app)
 }

 if (forceHttps) {
 app.use((req: Request, res: Response, next: NextFunction) => {
 if (req.headers['x-forwarded-proto'] !== 'https') {
 return res.redirect(301, `https://${req.headers.host}${req.url}`)
 }
 next()
 })
 }

 await app.listen(config.get<number>('APP_PORT') ?? 3000)
}

bootstrap()
