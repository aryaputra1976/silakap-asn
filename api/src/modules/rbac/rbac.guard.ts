import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RbacService } from './rbac.service'
import { PERMISSION_KEY } from '../../core/decorators/require-permission.decorator'

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbac: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>(
      PERMISSION_KEY,
      context.getHandler(),
    )

    if (!requiredPermission) return true

    const req = context.switchToHttp().getRequest()
    const user = req.user

    if (!user) {
      throw new ForbiddenException('User not authenticated')
    }

    const allowed = await this.rbac.userHasPermission(
      BigInt(user.sub),
      requiredPermission,
    )

    if (!allowed) {
      throw new ForbiddenException('Forbidden resource')
    }

    return true
  }
}