import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'

import * as jwt from 'jsonwebtoken'

@Injectable()
export class JwtGuard implements CanActivate {

  canActivate(context: ExecutionContext): boolean {

    const request = context.switchToHttp().getRequest()

    const authHeader = request.headers.authorization

    if (!authHeader) {
      throw new UnauthorizedException()
    }

    const token = authHeader.replace('Bearer ', '')

    try {

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      )

      request.user = decoded

      return true

    } catch {

      throw new UnauthorizedException()

    }

  }

}