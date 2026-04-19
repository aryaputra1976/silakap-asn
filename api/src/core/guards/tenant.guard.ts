import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common'
import { getTenantId } from '../tenant/tenant-context'

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest()
    const user = req.user
    const tenantId = getTenantId()

    // Tenant wajib ada
    if (!tenantId) {
      throw new UnauthorizedException('Tenant not resolved')
    }

    // User juga wajib ada (auth harus duluan)
    if (!user) {
      throw new UnauthorizedException('User not authenticated')
    }

    // Cek mismatch tenant
    if (user.tenantId !== tenantId) {
      throw new ForbiddenException('Tenant mismatch')
    }

    return true
  }
}