export interface MyProfile {
  id: string
  username: string
  isActive: boolean
  pegawaiId?: string | null
  roles: string[]
  pegawai?: {
    id: string
    nama: string
    nip?: string
  } | null
}