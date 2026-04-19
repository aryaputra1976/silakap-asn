export type User = {
  id: string
  username: string
  roles: string[]
  unitKerjaId: string | null
  bidangId: string | null
  opd: string | null
  pegawaiId?: string | null
  pegawai?: {
    id: string
    nama: string
    nip?: string
  } | null
}

export type LoginRequest = {
  username: string
  password: string
}

export type RegisterRequest = {
  password: string
  confirmPassword: string
  nip: string
  email: string
  noHp: string
}

export type RegisterPegawaiLookup = {
  id: string
  nip: string
  nipLama: string
  nama: string
  email: string
  noHp: string
  unorNama: string
}

export type LoginResponse = {
  access_token: string
  expires_in: number
  user: User
  permissions: string[]
}

export type RefreshResponse = {
  access_token: string
  expires_in: number
}

export type LogoutResponse = {
  success: boolean
}

export type RegisterResponse = {
  message: string
  registration: {
    id: string
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
    requestedRole: string | null
    username: string
    pegawaiId: string | null
    submittedAt: string
    pegawai: {
      nama: string
      nip: string
      unor: string | null
      email: string
      noHp: string
    } | null
  }
}

export type AuthTokenPayload = {
  sub: string
  id: string
  name: string
  role: string | null
  roles: string[]
  unitKerjaId?: string | null
  permissions: string[]
  exp: number
  iat: number
}

export type AuthSession = {
  user: User
  accessToken: string
  permissions: string[]
}
