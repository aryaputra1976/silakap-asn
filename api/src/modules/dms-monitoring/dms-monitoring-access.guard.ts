import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { DMS_ALLOWED_ROLES_KEY } from './dms-monitoring-access.decorator'

type DmsAuthenticatedUser = {
  role?: string | null
  roles?: string[]
}

@Injectable()
export class DmsMonitoringAccessGuard
  implements CanActivate
{
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles =
      this.reflector.getAllAndOverride<string[]>(
        DMS_ALLOWED_ROLES_KEY,
        [context.getHandler(), context.getClass()],
      )

    if (!allowedRoles || allowedRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user as DmsAuthenticatedUser | undefined

    const normalizedUserRoles = new Set(
      [
        ...(Array.isArray(user?.roles) ? user.roles : []),
        user?.role ?? undefined,
      ]
        .filter((role): role is string => Boolean(role))
        .map((role) => role.toUpperCase()),
    )

    const isAllowed = allowedRoles.some((role) =>
      normalizedUserRoles.has(role.toUpperCase()),
    )

    if (!isAllowed) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses ke modul DMS monitoring',
      )
    }

    return true
  }
}
