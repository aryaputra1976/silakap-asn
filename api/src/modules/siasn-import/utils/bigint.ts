export function toBigIntSafe(value: any, fallback: bigint = 1n): bigint {
  if (value === null || value === undefined) return fallback

  // Jika number → langsung BigInt
  if (typeof value === 'number') return BigInt(value)

  // Jika string → trim dulu
  if (typeof value === 'string') {
    const cleaned = value.trim()

    // kosong → fallback
    if (cleaned === '') return fallback

    // bukan angka → fallback
    if (!/^\d+$/.test(cleaned)) return fallback

    return BigInt(cleaned)
  }

  // tipe lain → fallback
  return fallback
}
