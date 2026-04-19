export interface CurrentUserResponse {
  id: string
  username: string
  isActive: boolean
  roles: string[]
  pegawaiId?: string | null
  pegawai?: {
    id: string
    nama: string
    nip?: string
  } | null
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}
