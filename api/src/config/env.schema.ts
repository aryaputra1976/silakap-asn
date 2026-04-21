import { z } from 'zod'

const booleanish = z.union([z.boolean(), z.string()]).transform((value) => {
 if (typeof value === 'boolean') return value
 return value.toLowerCase() === 'true'
})

export const envSchema = z.object({
 APP_NAME: z.string().min(1).default('SILAKAP API'),
 APP_ENV: z.enum(['development', 'production', 'test']),
 APP_PORT: z.coerce.number().int().positive().default(3000),
 APP_URL: z.string().url().default('http://localhost:3000'),
 APP_TRUST_PROXY: z.coerce.number().int().min(0).default(1),
 ENABLE_SWAGGER: booleanish.default(false),
 FORCE_HTTPS: booleanish.default(false),

 DATABASE_URL: z.string().min(1),

 JWT_SECRET: z.string().min(32),
 JWT_EXPIRES_IN: z.string().min(1).default('15m'),

 REDIS_ENABLED: booleanish.default(false),
 REDIS_HOST: z.string().min(1).default('127.0.0.1'),
 REDIS_PORT: z.coerce.number().int().positive().default(6379),
 REDIS_PASSWORD: z.string().optional(),

 MINIO_ENDPOINT: z.string().optional(),
 MINIO_ACCESS_KEY: z.string().optional(),
 MINIO_SECRET_KEY: z.string().optional(),
 MINIO_PORT: z.coerce.number().int().positive().optional(),
 MINIO_USE_SSL: booleanish.optional(),
 MINIO_BUCKET: z.string().optional(),

 CORS_ORIGIN: z.string().optional(),
 COOKIE_SAME_SITE: z.string().optional(),
})
