export interface JwtPayload {
  sub: string
  id: string
  name: string
  role?: string | null      // legacy compatibility
  roles: string[]           // primary
  permissions: string[]
  unitKerjaId?: string | null
  bidangId?: string | null
  opd?: string | null
}