import { RiwayatJabatanRow } from '../../dto/riwayat-jabatan-row.interface'
import { parseDate } from './util.date'

const toBigIntOrNull = (v: any): bigint | null => {
  if (!v) return null
  const n = Number(v)
  if (Number.isNaN(n)) return null
  return BigInt(n)
}

export const mapRiwayatJabatan = (row: RiwayatJabatanRow) => {
  const tmt = parseDate(row['TMT JABATAN'])
  if (!tmt) {
    throw new Error('TMT JABATAN wajib diisi')
  }

  return {
    jenisJabatanId: null, // resolve di service via lookup RefJenisJabatan
    jabatanId: null, // resolve di service via lookup RefJabatan
    instansiId: null, // resolve di service via lookup RefInstansi
    satkerId: null, // resolve di service via lookup RefSatker
    unorId: toBigIntOrNull(row['UNOR ID']),
    lokasiKerjaId: null, // resolve via lookup jika ada

    nomorSk: row['NOMOR SK'] ?? null,
    tanggalSk: parseDate(row['TANGGAL SK']),
    tmtJabatan: tmt,

    rawSiasnJson: row,
  }
}