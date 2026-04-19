import { KelengkapanItem } from "./completeness.types"

type CompletenessStats = {
  total: number
  terpenuhi: number
  isLengkap: boolean
  missing: string[]
  isComplete: boolean
}

/**
 * membuat set dokumen pegawai
 * untuk mempercepat pengecekan
 */
export function createDokumenSet(
  dokumen: { jenisId: bigint }[]
): Set<bigint> {

  return new Set(
    dokumen.map(d => d.jenisId)
  )

}

/**
 * cek apakah dokumen tersedia
 */
export function checkDokumenStatus(
  dokumenSet: Set<bigint>,
  jenisId: bigint
): boolean {

  return dokumenSet.has(jenisId)

}

/**
 * hitung statistik kelengkapan
 */
export function calculateCompletenessStats(
  items: KelengkapanItem[]
): CompletenessStats {

  const total = items.length

  const terpenuhi =
    items.filter(i => i.status).length

  const missing =
    items
      .filter(i => !i.status && i.wajib)
      .map(i => i.nama)

  const isLengkap = missing.length === 0

  return {

    total,

    terpenuhi,

    isLengkap,

    missing,

    isComplete: isLengkap

  }

}