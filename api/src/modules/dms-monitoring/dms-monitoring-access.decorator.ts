import { SetMetadata } from '@nestjs/common'

export const DMS_ALLOWED_ROLES_KEY = 'dms_allowed_roles'

export const AllowDmsRoles = (...roles: string[]) =>
  SetMetadata(DMS_ALLOWED_ROLES_KEY, roles)
