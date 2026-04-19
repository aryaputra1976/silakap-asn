import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Role } from '../enums/roles.enum';
import { SecurityLoggerService } from '../../core/security/security-logger.service';
import { SecurityEvent } from '../../core/security/security-event.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly security: SecurityLoggerService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // 1️⃣ Public endpoint → lolos
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    // 2️⃣ Role yang dibutuhkan endpoint
    const requiredRoles =
      this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    // 3️⃣ User dari JWT
    const user = request.user as { userId: string; roles?: Role[] };

    if (!user || !user.roles || user.roles.length === 0) {
      this.security.log(SecurityEvent.ACCESS_FORBIDDEN, {
        reason: 'ROLE_NOT_FOUND',
        path: request.url,
        method: request.method,
      });

      throw new ForbiddenException('Forbidden: role not found');
    }

    // 4️⃣ Cek apakah salah satu role cocok
    const hasRole = user.roles.some((r) => requiredRoles.includes(r));

    if (!hasRole) {
      this.security.log(SecurityEvent.ACCESS_FORBIDDEN, {
        reason: 'INSUFFICIENT_ROLE',
        userId: user.userId,
        roles: user.roles,
        requiredRoles,
        path: request.url,
        method: request.method,
      });

      throw new ForbiddenException('Forbidden: insufficient role');
    }

    return true;
  }
}