import { Prisma } from '@prisma/client'

import { BusinessError } from '@/core/errors/business.error'
import { ServiceHandler } from '../../registry/services.registry.types'

// ---- kelompok jenis perubahan ----

const JENIS_STRING = [
  'NAMA', 'NIK', 'GELAR_DEPAN', 'GELAR_BELAKANG', 'TEMPAT_LAHIR',
  'ALAMAT', 'NO_HP', 'EMAIL',
  'SK_CPNS_NOMOR', 'SK_PNS_NOMOR', 'NPWP', 'BPJS',
  'NOMOR_IJAZAH', 'NAMA_SEKOLAH',
] as const

const JENIS_TANGGAL = [
  'TANGGAL_LAHIR', 'TMT_CPNS', 'TMT_PNS',
  'SK_CPNS_TANGGAL', 'SK_PNS_TANGGAL',
] as const

const JENIS_ANGKA = ['MK_TAHUN', 'MK_BULAN'] as const

const JENIS_FK = ['AGAMA', 'JENIS_KELAMIN', 'STATUS_PERKAWINAN'] as const

const SEMUA_JENIS = [
  ...JENIS_STRING, ...JENIS_TANGGAL, ...JENIS_ANGKA, ...JENIS_FK,
] as const

type JenisPerubahan = typeof SEMUA_JENIS[number]

export interface PeremajaanPayload {
  jenisPerubahan?: string
  nilaiBaru?: string
  keterangan?: string
}

// ---- mapping jenis → field Prisma ----

const FIELD_STRING_MAP: Partial<Record<JenisPerubahan, keyof Prisma.SilakapPegawaiUpdateInput>> = {
  NAMA: 'nama',
  NIK: 'nik',
  GELAR_DEPAN: 'gelarDepan',
  GELAR_BELAKANG: 'gelarBelakang',
  TEMPAT_LAHIR: 'tempatLahir',
  ALAMAT: 'alamat',
  NO_HP: 'noHp',
  EMAIL: 'email',
  SK_CPNS_NOMOR: 'skCpnsNomor',
  SK_PNS_NOMOR: 'skPnsNomor',
  NPWP: 'npwpNomor',
  BPJS: 'bpjsNomor',
  NOMOR_IJAZAH: 'nomorIjazah',
  NAMA_SEKOLAH: 'namaSekolahTerakhir',
}

const FIELD_TANGGAL_MAP: Partial<Record<JenisPerubahan, keyof Prisma.SilakapPegawaiUpdateInput>> = {
  TANGGAL_LAHIR: 'tanggalLahir',
  TMT_CPNS: 'tmtCpns',
  TMT_PNS: 'tmtPns',
  SK_CPNS_TANGGAL: 'skCpnsTanggal',
  SK_PNS_TANGGAL: 'skPnsTanggal',
}

const FIELD_ANGKA_MAP: Partial<Record<JenisPerubahan, keyof Prisma.SilakapPegawaiUpdateInput>> = {
  MK_TAHUN: 'mkTahun',
  MK_BULAN: 'mkBulan',
}

// ---- service ----

export class DataUpdateService implements ServiceHandler {

  async createDetail(
    tx: Prisma.TransactionClient,
    usulId: bigint,
    payload?: unknown,
  ): Promise<void> {
    const p = this.parsePayload(payload)

    if (!p?.jenisPerubahan || !p?.nilaiBaru) {
      throw new BusinessError(
        'PEREMAJAAN_PAYLOAD_REQUIRED',
        'jenisPerubahan dan nilaiBaru wajib diisi',
      )
    }

    const jenis = this.normalizeJenis(p.jenisPerubahan)
    const nilaiBaru = p.nilaiBaru.trim()

    if (!nilaiBaru) {
      throw new BusinessError('NILAI_BARU_REQUIRED', 'Nilai baru wajib diisi')
    }

    if ((JENIS_TANGGAL as readonly string[]).includes(jenis)) {
      const parsed = new Date(nilaiBaru)
      if (Number.isNaN(parsed.getTime())) {
        throw new BusinessError('TANGGAL_TIDAK_VALID', `Format tanggal tidak valid: ${nilaiBaru}`)
      }
    }

    if ((JENIS_ANGKA as readonly string[]).includes(jenis)) {
      if (Number.isNaN(parseInt(nilaiBaru, 10))) {
        throw new BusinessError('ANGKA_TIDAK_VALID', `Nilai harus berupa angka: ${nilaiBaru}`)
      }
    }

    const existing = await tx.silakapPeremajaan.findUnique({
      where: { layananId: usulId },
    })
    if (existing) {
      throw new BusinessError('PEREMAJAAN_EXISTS', 'Detail peremajaan sudah ada')
    }

    const usul = await tx.silakapUsulLayanan.findUnique({
      where: { id: usulId },
      include: {
        pegawai: {
          select: {
            id: true,
            nama: true,
            nik: true,
            gelarDepan: true,
            gelarBelakang: true,
            tempatLahir: true,
            tanggalLahir: true,
            alamat: true,
            noHp: true,
            email: true,
            skCpnsNomor: true,
            skCpnsTanggal: true,
            tmtCpns: true,
            skPnsNomor: true,
            skPnsTanggal: true,
            tmtPns: true,
            mkTahun: true,
            mkBulan: true,
            npwpNomor: true,
            bpjsNomor: true,
            nomorIjazah: true,
            namaSekolahTerakhir: true,
            agama: { select: { nama: true } },
            jenisKelamin: { select: { nama: true } },
            statusPerkawinan: { select: { nama: true } },
          },
        },
      },
    })

    if (!usul?.pegawai) {
      throw new BusinessError('PEGAWAI_NOT_FOUND', 'Pegawai tidak ditemukan')
    }

    const nilaiLama = this.getNilaiLama(usul.pegawai, jenis)

    await tx.silakapPeremajaan.create({
      data: {
        layananId: usulId,
        jenisPerubahan: jenis,
        keterangan: p.keterangan?.trim() || null,
        dataLama: { value: nilaiLama },
        dataBaru: { value: nilaiBaru },
      },
    })
  }

  async validateSubmit(
    tx: Prisma.TransactionClient,
    usulId: bigint,
  ): Promise<void> {
    const detail = await tx.silakapPeremajaan.findUnique({
      where: { layananId: usulId },
    })
    if (!detail) {
      throw new BusinessError('PEREMAJAAN_DETAIL_NOT_FOUND', 'Detail peremajaan belum dibuat')
    }
  }

  async afterTransition(
    tx: Prisma.TransactionClient,
    usulId: bigint,
    actionCode: string,
  ): Promise<void> {
    if (actionCode.toUpperCase() !== 'APPROVE') return

    const detail = await tx.silakapPeremajaan.findUnique({
      where: { layananId: usulId },
      include: { layanan: { select: { pegawaiId: true } } },
    })

    if (!detail?.layanan) {
      throw new BusinessError('PEREMAJAAN_DETAIL_NOT_FOUND', 'Detail peremajaan tidak ditemukan')
    }

    const nilaiBaru = this.readJsonValue(detail.dataBaru)
    if (!nilaiBaru) {
      throw new BusinessError('NILAI_BARU_NOT_FOUND', 'Nilai baru peremajaan tidak ditemukan')
    }

    const jenis = this.normalizeJenis(detail.jenisPerubahan)
    const pegawaiId = detail.layanan.pegawaiId
    let updateData: Prisma.SilakapPegawaiUpdateInput = {}

    // Kelompok A — string langsung
    const fieldStr = FIELD_STRING_MAP[jenis]
    if (fieldStr) {
      updateData = { [fieldStr]: nilaiBaru }
    }

    // Kelompok B — tanggal
    const fieldTgl = FIELD_TANGGAL_MAP[jenis]
    if (fieldTgl) {
      const parsed = new Date(nilaiBaru)
      if (Number.isNaN(parsed.getTime())) {
        throw new BusinessError('TANGGAL_TIDAK_VALID', `Format tanggal tidak valid: ${nilaiBaru}`)
      }
      updateData = { [fieldTgl]: parsed }
    }

    // Kelompok C — angka
    const fieldAngka = FIELD_ANGKA_MAP[jenis]
    if (fieldAngka) {
      const parsed = parseInt(nilaiBaru, 10)
      if (Number.isNaN(parsed)) {
        throw new BusinessError('ANGKA_TIDAK_VALID', `Nilai bukan angka: ${nilaiBaru}`)
      }
      updateData = { [fieldAngka]: parsed }
    }

    // Kelompok D — FK reference (lookup by nama)
    if (jenis === 'AGAMA') {
      const ref = await tx.refAgama.findFirst({
        where: { nama: { equals: nilaiBaru } },
        select: { id: true },
      })
      if (!ref) throw new BusinessError('REF_NOT_FOUND', `Agama '${nilaiBaru}' tidak ditemukan`)
      updateData = { agama: { connect: { id: ref.id } } }
    }

    if (jenis === 'JENIS_KELAMIN') {
      const ref = await tx.refJenisKelamin.findFirst({
        where: { nama: { equals: nilaiBaru } },
        select: { id: true },
      })
      if (!ref) throw new BusinessError('REF_NOT_FOUND', `Jenis kelamin '${nilaiBaru}' tidak ditemukan`)
      updateData = { jenisKelamin: { connect: { id: ref.id } } }
    }

    if (jenis === 'STATUS_PERKAWINAN') {
      const ref = await tx.refStatusPerkawinan.findFirst({
        where: { nama: { equals: nilaiBaru } },
        select: { id: true },
      })
      if (!ref) throw new BusinessError('REF_NOT_FOUND', `Status perkawinan '${nilaiBaru}' tidak ditemukan`)
      updateData = { statusPerkawinan: { connect: { id: ref.id } } }
    }

    if (Object.keys(updateData).length === 0) return

    await tx.silakapPegawai.update({
      where: { id: pegawaiId },
      data: updateData,
    })
  }

  private parsePayload(payload: unknown): PeremajaanPayload | null {
    if (!payload || typeof payload !== 'object') return null
    const r = payload as Record<string, unknown>
    return {
      jenisPerubahan: typeof r.jenisPerubahan === 'string' ? r.jenisPerubahan : undefined,
      nilaiBaru: typeof r.nilaiBaru === 'string' ? r.nilaiBaru : undefined,
      keterangan: typeof r.keterangan === 'string' ? r.keterangan : undefined,
    }
  }

  private normalizeJenis(value: string): JenisPerubahan {
    const normalized = value.trim().toUpperCase()
    if (!SEMUA_JENIS.includes(normalized as JenisPerubahan)) {
      throw new BusinessError('JENIS_PERUBAHAN_INVALID', `Jenis perubahan tidak valid: ${value}`)
    }
    return normalized as JenisPerubahan
  }

  private getNilaiLama(
    pegawai: {
      nama: string
      nik: string | null
      gelarDepan: string | null
      gelarBelakang: string | null
      tempatLahir: string | null
      tanggalLahir: Date | null
      alamat: string | null
      noHp: string | null
      email: string | null
      skCpnsNomor: string | null
      skCpnsTanggal: Date | null
      tmtCpns: Date | null
      skPnsNomor: string | null
      skPnsTanggal: Date | null
      tmtPns: Date | null
      mkTahun: number | null
      mkBulan: number | null
      npwpNomor: string | null
      bpjsNomor: string | null
      nomorIjazah: string | null
      namaSekolahTerakhir: string | null
      agama: { nama: string } | null
      jenisKelamin: { nama: string } | null
      statusPerkawinan: { nama: string } | null
    },
    jenis: JenisPerubahan,
  ): string | null {
    const map: Record<JenisPerubahan, string | number | Date | null | undefined> = {
      NAMA: pegawai.nama,
      NIK: pegawai.nik,
      GELAR_DEPAN: pegawai.gelarDepan,
      GELAR_BELAKANG: pegawai.gelarBelakang,
      TEMPAT_LAHIR: pegawai.tempatLahir,
      TANGGAL_LAHIR: pegawai.tanggalLahir,
      ALAMAT: pegawai.alamat,
      NO_HP: pegawai.noHp,
      EMAIL: pegawai.email,
      SK_CPNS_NOMOR: pegawai.skCpnsNomor,
      SK_CPNS_TANGGAL: pegawai.skCpnsTanggal,
      TMT_CPNS: pegawai.tmtCpns,
      SK_PNS_NOMOR: pegawai.skPnsNomor,
      SK_PNS_TANGGAL: pegawai.skPnsTanggal,
      TMT_PNS: pegawai.tmtPns,
      MK_TAHUN: pegawai.mkTahun,
      MK_BULAN: pegawai.mkBulan,
      NPWP: pegawai.npwpNomor,
      BPJS: pegawai.bpjsNomor,
      NOMOR_IJAZAH: pegawai.nomorIjazah,
      NAMA_SEKOLAH: pegawai.namaSekolahTerakhir,
      AGAMA: pegawai.agama?.nama,
      JENIS_KELAMIN: pegawai.jenisKelamin?.nama,
      STATUS_PERKAWINAN: pegawai.statusPerkawinan?.nama,
    }

    const val = map[jenis]
    if (val === null || val === undefined) return null
    if (val instanceof Date) return val.toISOString().split('T')[0]
    return String(val)
  }

  private readJsonValue(value: Prisma.JsonValue | null): string | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null
    const raw = (value as Prisma.JsonObject).value
    return typeof raw === 'string' && raw.trim() ? raw.trim() : null
  }
}
