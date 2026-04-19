import { RiwayatPangkatRow } from '../../dto/riwayat-pangkat-row.interface'
import { parseDate } from './util.date'

const toBigIntRequired = (v: any): bigint => {
  const n = Number(v)
  if (!v || Number.isNaN(n)) {
    throw new Error('GOLONGAN ID wajib valid')
  }
  return BigInt(n)
}

export const mapRiwayatPangkat = (row: RiwayatPangkatRow) => {
  const tmt = parseDate(row['TMT GOLONGAN'])
  if (!tmt) {
    throw new Error('TMT GOLONGAN wajib diisi')
  }

  return {
    golonganId: toBigIntRequired(row['GOLONGAN ID']),
    tmtPangkat: tmt,
    nomorSk: row['NOMOR SK'] ?? null,
    tanggalSk: parseDate(row['TANGGAL SK']),
    rawSiasnJson: row,
  }
}