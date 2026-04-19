import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PERMISSION_KEY } from '../decorators/permission.decorator'

interface JwtUserPayload {
  id: string
  username: string
  permissions?: string[] // ← penting
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY, [
        context.getHandler(),
        context.getClass(),
      ])

    // kalau endpoint tidak butuh permission → boleh
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user as JwtUserPayload | undefined
console.log('USER PERMISSIONS:', user)
    if (!user) {
      throw new ForbiddenException('User not authenticated')
    }

    const userPermissions = user.permissions ?? []

    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    )

    if (!hasPermission) {
      throw new ForbiddenException('Anda tidak memiliki izin akses')
    }

    return true
  }
}