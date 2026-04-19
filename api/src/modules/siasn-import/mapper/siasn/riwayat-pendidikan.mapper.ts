import { RiwayatPendidikanRow } from '../../dto/riwayat-pendidikan-row.interface'

const toBigIntOrNull = (v: any): bigint | null => {
  if (!v) return null
  const n = Number(v)
  if (Number.isNaN(n)) return null
  return BigInt(n)
}

const toIntOrNull = (v: any): number | null => {
  if (!v) return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

export const mapRiwayatPendidikan = (row: RiwayatPendidikanRow) => ({
  pendidikanId: toBigIntOrNull(row['PENDIDIKAN ID']),
  pendidikanTingkatId: toBigIntOrNull(row['TINGKAT PENDIDIKAN ID']),
  namaSekolah: row['NAMA SEKOLAH'] ?? null,
  tahunLulus: toIntOrNull(row['TAHUN LULUS']),
  rawSiasnJson: row,
})