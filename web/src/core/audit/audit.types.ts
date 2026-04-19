export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'SUBMIT'
  | 'VERIFY'
  | 'RETURN'
  | 'APPROVE'
  | 'REJECT'
  | 'LOGIN'
  | 'LOGOUT'
  | 'SYNC_SIASN'

export interface AuditLogPayload {
  action: AuditAction
  entity: string            // contoh: "LAYANAN_PENSIUN"
  entityId?: string
  description?: string
  metadata?: Record<string, any>
}