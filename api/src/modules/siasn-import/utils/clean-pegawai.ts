// src/modules/siasn-import/utils/clean-pegawai.ts

export function cleanPegawaiData<T extends Record<string, any>>(obj: T): T {
  const cleaned: any = {}

  for (const key of Object.keys(obj)) {
    const val = obj[key]

    if (val === undefined) continue

    // convert number → BigInt untuk field camelCase Id
    if (key.endsWith('Id') && typeof val === 'number') {
      cleaned[key] = BigInt(val)
      continue
    }

    cleaned[key] = val
  }

  return cleaned
}