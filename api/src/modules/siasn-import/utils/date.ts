// src/modules/siasn-import/utils/date.ts

export function parseDate(value?: string | null): Date | null {
  if (!value) return null

  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}

export function parseSiasnDate(value?: string | null): Date | null {
  if (!value) return null

  // Format SIASN biasanya: "2020-01-01T00:00:00Z"
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}
