import { PegawaiSiasnRow } from '../../dto/pegawai-siasn-row.interface'
import { parseSiasnDate } from '../../utils/date'

const cleanString = (v: any): string | null => {
  if (v === null || v === undefined) return null
  const s = v.toString().trim()
  if (!s) return null
  return s.replace(/^'+/, '') // hapus tanda petik depan dari Excel
}

const toIntOrNull = (v: any): number | null => {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

const toBigIntOrNull = (v: any): bigint | null => {
  if (v === null || v === undefined || v === '') return null
  if (typeof v === 'number') return BigInt(v)
  if (typeof v === 'string' && /^\d+$/.test(v.trim()))
    return BigInt(v.trim())
  return null
}

export function mapPegawaiSiasn(row: PegawaiSiasnRow) {
  return {
    // ================= IDENTITAS =================
    nip: cleanString(row['NIP BARU']),
    nipLama: cleanString(row['NIP LAMA']),
    nik: cleanString(row['NIK']),
    nama: cleanString(row['NAMA']),
    gelarDepan: cleanString(row['GELAR DEPAN']),
    gelarBelakang: cleanString(row['GELAR BELAKANG']),

    // ================= TEMPAT LAHIR =================
    tempatLahirId: null,
    tempatLahir: cleanString(row['TEMPAT LAHIR NAMA']),
    tanggalLahir: parseSiasnDate(row['TANGGAL LAHIR']),

    // ================= REFERENSI DASAR =================
    jenisKelaminId: toBigIntOrNull(row['JENIS KELAMIN']),
    agamaId: toBigIntOrNull(row['AGAMA ID']),
    statusPerkawinanId: toBigIntOrNull(row['JENIS KAWIN ID']),
    jenisPegawaiId: toBigIntOrNull(row['JENIS PEGAWAI ID']),
    jenisPegawaiNama: cleanString(row['JENIS PEGAWAI NAMA']),

    // ================= KEPEGAWAIAN =================
    kedudukanHukumId: toBigIntOrNull(row['KEDUDUKAN HUKUM ID']),
    statusCpnsPns: cleanString(row['STATUS CPNS PNS']),

    // ================= GOLONGAN =================
    golonganAwalId: toBigIntOrNull(row['GOL AWAL ID']),
    tmtGolonganAwal: null,
    golonganAktifId: toBigIntOrNull(row['GOL AKHIR ID']),
    tmtGolongan: parseSiasnDate(row['TMT GOLONGAN']),
    mkTahun: toIntOrNull(row['MK TAHUN']),
    mkBulan: toIntOrNull(row['MK BULAN']),

    // ================= JABATAN =================
    jenisJabatanId: toBigIntOrNull(row['JENIS JABATAN ID']),
    tmtJabatan: parseSiasnDate(row['TMT JABATAN']),
    skJabatanNomor: null,
    skJabatanTanggal: null,

    // ================= PENDIDIKAN =================
    pendidikanTingkatId: toBigIntOrNull(row['TINGKAT PENDIDIKAN ID']),
    pendidikanId: toBigIntOrNull(row['PENDIDIKAN ID']),
    tahunLulus: toIntOrNull(row['TAHUN LULUS']),
    namaSekolahTerakhir: cleanString(row['NAMA SEKOLAH']),
    nomorIjazah: null,

    // ================= KONTAK =================
    alamat: cleanString(row['ALAMAT']),
    noHp: cleanString(row['NOMOR HP']), // STRING, bukan number
    email: cleanString(row['EMAIL']),
    emailPemerintah: cleanString(row['EMAIL GOV']),

    // ================= CPNS / PNS =================
    skCpnsNomor: cleanString(row['NOMOR SK CPNS']),
    skCpnsTanggal: parseSiasnDate(row['TANGGAL SK CPNS']),
    tmtCpns: parseSiasnDate(row['TMT CPNS']),

    skPnsNomor: cleanString(row['NOMOR SK PNS']),
    skPnsTanggal: parseSiasnDate(row['TANGGAL SK PNS']),
    tmtPns: parseSiasnDate(row['TMT PNS']),

    // ================= NOMOR-NOMOR =================
    bpjsNomor: cleanString(row['BPJS']),
    npwpNomor: cleanString(row['NPWP NOMOR']),
    kartuAsnVirtual: cleanString(row['KARTU ASN VIRTUAL']),

    // ================= INSTANSI & UNIT =================
    instansiIndukId: null,
    instansiKerjaId: null,
    satkerIndukId: null,
    satkerKerjaId: null,
    unorId: null,
    unorIndukId: null,
    lokasiKerjaId: null,
    kpknId: null,

    // ================= SIASN =================
    siasnId: cleanString(row['PNS ID']),
    sapkId: null,
    refSiasn: null,

    // ================= FLAG =================
    isValidNik:
      row['IS VALID NIK'] === 1 ||
      row['IS VALID NIK'] === '1',
    flagIkd:
      row['FLAG IKD'] === 1 ||
      row['FLAG IKD'] === '1',

    // ================= RAW =================
    rawSiasnJson: JSON.parse(JSON.stringify(row)),
  }
}