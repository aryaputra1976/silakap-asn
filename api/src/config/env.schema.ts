import { z } from 'zod'

const booleanish = z.union([z.boolean(), z.string()]).transform((value) => {
  if (typeof value === 'boolean') {
    return value
  }

  return value.toLowerCase() === 'true'
})

export const envSchema = z
  .object({
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

    MINIO_ENDPOINT: z.string().min(1),
    MINIO_PORT: z.coerce.number().int().positive(),
    MINIO_USE_SSL: booleanish.default(false),
    MINIO_ACCESS_KEY: z.string().min(1),
    MINIO_SECRET_KEY: z.string().min(1),
    MINIO_BUCKET: z.string().min(1),

    SINGLE_TENANT: booleanish.default(true),
    DEFAULT_TENANT: z.string().min(1).default('default'),

    CORS_ORIGIN: z.string().min(1),

    COOKIE_SECURE: booleanish.default(false),
    COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('strict'),
  })
  .superRefine((env, ctx) => {
    if (env.APP_ENV !== 'production') {
      return
    }

    if (!env.FORCE_HTTPS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['FORCE_HTTPS'],
        message: 'FORCE_HTTPS harus true di production',
      })
    }

    if (!env.REDIS_ENABLED) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['REDIS_ENABLED'],
        message: 'REDIS_ENABLED harus true di production',
      })
    }

    if (env.CORS_ORIGIN.includes('*')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CORS_ORIGIN'],
        message: 'CORS_ORIGIN wildcard tidak diizinkan di production',
      })
    }

    if (!env.COOKIE_SECURE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['COOKIE_SECURE'],
        message: 'COOKIE_SECURE harus true di production',
      })
    }

    if (env.COOKIE_SAME_SITE === 'none' && !env.COOKIE_SECURE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['COOKIE_SAME_SITE'],
        message: 'COOKIE_SAME_SITE=none membutuhkan COOKIE_SECURE=true',
      })
    }
  })
