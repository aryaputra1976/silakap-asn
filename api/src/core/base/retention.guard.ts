import { ForbiddenException } from '@nestjs/common'

export function enforceRetention(entity: {
  retention_until?: Date | null
  legal_hold?: boolean
}) {
  if (!entity) return

  if (entity.legal_hold) {
    throw new ForbiddenException('Data under legal hold')
  }

  if (entity.retention_until && new Date() < entity.retention_until) {
    throw new ForbiddenException('Retention period not expired')
  }
}