# Production Readiness

Backend ini sudah dirapikan untuk deployment yang lebih aman, dengan fokus pada:

- satu source of truth workflow runtime
- contract environment yang lebih ketat
- health check untuk database dan Redis
- cookie refresh token yang dikontrol config
- cleanup legacy files, scripts, dan schema redundan

## Minimum Production Config

Nilai berikut wajib aman di production:

- `APP_ENV=production`
- `FORCE_HTTPS=true`
- `REDIS_ENABLED=true`
- `COOKIE_SECURE=true`
- `CORS_ORIGIN` tidak boleh wildcard
- `JWT_SECRET` minimal 32 karakter dan harus random

## Recommended Deployment Steps

1. Jalankan migration database.
2. Regenerate Prisma client.
3. Seed workflow baseline bila environment baru.
4. Pastikan Redis dan MinIO reachable dari aplikasi.
5. Pastikan reverse proxy mengirim `X-Forwarded-Proto=https`.
6. Pantau endpoint `/api/health` setelah deploy.

## Suggested Commands

```bash
npm run prisma:generate
npm run build
```
