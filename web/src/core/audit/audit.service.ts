import { api } from '@/services/api'
import type { AuditLogPayload } from './audit.types'

export async function sendAudit(payload: AuditLogPayload) {
  try {
    await api.post('/audit/logs', payload)
  } catch (err) {
    // ❗ audit tidak boleh ganggu UX
    console.error('Audit send failed', err)
  }
}