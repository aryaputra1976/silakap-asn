import { useCallback } from 'react'
import { sendAudit } from './audit.service'
import type { AuditLogPayload } from './audit.types'

export function useAudit() {
  const log = useCallback(async (payload: AuditLogPayload) => {
    await sendAudit(payload)
  }, [])

  return { log }
}