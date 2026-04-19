// apps/api/tools/security-audit.ts
import * as fs from 'fs';
import * as https from 'https';

type CheckResult = { name: string; ok: boolean; details?: string };

function logResult(result: CheckResult) {
  const icon = result.ok ? '✅' : '❌';
  console.log(`${icon} ${result.name}${result.details ? ' → ' + result.details : ''}`);
}

function checkHttpsEnv(): CheckResult {
  const behindProxy = process.env.BEHIND_PROXY === 'true';
  const httpsOnly = process.env.FORCE_HTTPS === 'true';
  return {
    name: 'HTTPS enforced (reverse proxy / HSTS)',
    ok: behindProxy && httpsOnly,
    details: `BEHIND_PROXY=${process.env.BEHIND_PROXY}, FORCE_HTTPS=${process.env.FORCE_HTTPS}`,
  };
}

function checkJwtSecret(): CheckResult {
  const secret = process.env.JWT_SECRET || '';
  return {
    name: 'JWT_SECRET strong & present',
    ok: secret.length >= 32,
    details: `length=${secret.length}`,
  };
}

function checkEnvProduction(): CheckResult {
  const nodeEnv = process.env.NODE_ENV;
  const corsOrigin = process.env.CORS_ORIGIN;
  return {
    name: 'ENV production & CORS not wildcard',
    ok: nodeEnv === 'production' && !!corsOrigin && corsOrigin !== '*',
    details: `NODE_ENV=${nodeEnv}, CORS_ORIGIN=${corsOrigin}`,
  };
}

function checkDbEnv(): CheckResult {
  const url = process.env.DATABASE_URL || '';
  const isLocal = url.includes('localhost') || url.includes('127.0.0.1');
  return {
    name: 'Database URL not localhost',
    ok: !!url && !isLocal,
    details: `DATABASE_URL set=${!!url}, localhost=${isLocal}`,
  };
}

function checkRedisEnv(): CheckResult {
  const url = process.env.REDIS_URL || '';
  const hasPassword = url.includes('@');
  const isLocal = url.includes('localhost') || url.includes('127.0.0.1');
  return {
    name: 'Redis URL secure (password & not localhost)',
    ok: !!url && hasPassword && !isLocal,
    details: `REDIS_URL set=${!!url}, hasPassword=${hasPassword}, localhost=${isLocal}`,
  };
}

function checkRateLimitFlags(): CheckResult {
  const loginGuard = process.env.ENABLE_LOGIN_BRUTE_GUARD === 'true';
  const rateLimit = process.env.ENABLE_RATE_LIMIT === 'true';
  return {
    name: 'Rate limit & brute force guard enabled',
    ok: loginGuard && rateLimit,
    details: `LOGIN_GUARD=${loginGuard}, RATE_LIMIT=${rateLimit}`,
  };
}

function checkCookieSecurity(): CheckResult {
  const secure = process.env.COOKIE_SECURE === 'true';
  const httpOnly = process.env.COOKIE_HTTP_ONLY === 'true';
  const sameSite = process.env.COOKIE_SAME_SITE;
  return {
    name: 'Cookie security (secure, httpOnly, sameSite=strict)',
    ok: secure && httpOnly && sameSite === 'strict',
    details: `secure=${secure}, httpOnly=${httpOnly}, sameSite=${sameSite}`,
  };
}

function checkSwaggerDisabled(): CheckResult {
  const swaggerEnabled = process.env.ENABLE_SWAGGER === 'true';
  const nodeEnv = process.env.NODE_ENV;
  return {
    name: 'Swagger disabled in production',
    ok: !(nodeEnv === 'production' && swaggerEnabled),
    details: `NODE_ENV=${nodeEnv}, ENABLE_SWAGGER=${swaggerEnabled}`,
  };
}

function checkLogLevel(): CheckResult {
  const level = process.env.LOG_LEVEL || 'debug';
  return {
    name: 'Log level not debug in production',
    ok: process.env.NODE_ENV !== 'production' || level !== 'debug',
    details: `LOG_LEVEL=${level}`,
  };
}

async function main() {
  console.log('🧠 Security Audit – Silakap API\n');

  const checks: CheckResult[] = [
    checkHttpsEnv(),
    checkJwtSecret(),
    checkEnvProduction(),
    checkDbEnv(),
    checkRedisEnv(),
    checkRateLimitFlags(),
    checkCookieSecurity(),
    checkSwaggerDisabled(),
    checkLogLevel(),
  ];

  for (const c of checks) logResult(c);

  console.log('\n⚠️  Beberapa hal lain tetap perlu dicek manual:');
  console.log('- Prisma migrate & index tenant_id / refresh_hash');
  console.log('- Redis maxmemory-policy & persistence');
  console.log('- Graceful shutdown (Prisma, Redis, BullMQ, OTel)');
}

main().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
