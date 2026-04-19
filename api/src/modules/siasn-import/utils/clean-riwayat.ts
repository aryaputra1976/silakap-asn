// src/modules/siasn-import/utils/clean-riwayat.ts

export function cleanRiwayatData(obj: any) {
  const cleaned: any = {}

  for (const key of Object.keys(obj)) {
    const val = obj[key]

    if (val === undefined) continue

    // convert number → BigInt untuk semua kolom *_id
    if (key.endsWith('_id') && typeof val === 'number') {
      cleaned[key] = BigInt(val)
      continue
    }

    cleaned[key] = val
  }

  return cleaned
}
