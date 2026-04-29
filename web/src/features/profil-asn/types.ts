export type StatusAsn =
  | "PNS"
  | "PPPK"
  | "PPPK_PARUH_WAKTU"

export type AsnEntity = {
  id: number
  isActive: boolean   // ← wajib untuk MasterTable
  nip: string
  nama: string
  statusAsn: StatusAsn
  jabatan?: string
  golongan?: string
  unitKerja?: string
}