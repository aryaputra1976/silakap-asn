// src/modules/siasn-import/utils/string.ts

export function cleanString(value?: string | null): string | null {
  if (!value) return null
  const v = value.trim()
  return v.length === 0 ? null : v
}

export function toNumber(value?: any): number | null {
  if (value === undefined || value === null) return null
  const n = Number(value)
  return isNaN(n) ? null : n
}
