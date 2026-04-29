export class PasanganDto {
  id!: number
  nama!: string
  tanggalLahir!: Date
  tanggalNikah!: Date
  urutanPernikahan!: number
  statusPernikahan!: string
}

export class AnakDto {
  id!: number
  nama!: string
  tanggalLahir!: Date
  statusAnak!: string
  namaAyah?: string | null
  namaIbu?: string | null
}

export class RiwayatKeluargaDto {
  pasangan!: PasanganDto[]
  anak!: AnakDto[]
}
