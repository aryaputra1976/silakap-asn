import { randomBytes, createHash, timingSafeEqual } from 'crypto'

/**
 * Generate refresh token random (512-bit → sangat kuat)
 */
export function generateRefreshToken(): string {
  return randomBytes(64).toString('hex') // 128 char
}

/**
 * Hash refresh token sebelum simpan ke DB
 */
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Compare token dengan hash DB secara timing-safe
 */
export function verifyRefreshToken(token: string, hash: string): boolean {
  const tokenHash = hashRefreshToken(token)

  const a = Buffer.from(tokenHash, 'hex')
  const b = Buffer.from(hash, 'hex')

  if (a.length !== b.length) return false

  return timingSafeEqual(a, b)
}