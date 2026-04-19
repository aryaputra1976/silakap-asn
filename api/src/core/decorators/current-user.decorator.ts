import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { AuthenticatedUser } from '@/modules/auth/strategies/jwt.strategy'

export const CurrentUser = createParamDecorator(
  <K extends keyof AuthenticatedUser>(
    data: K | undefined,
    ctx: ExecutionContext,
  ): AuthenticatedUser[K] | AuthenticatedUser | null => {
    const request = ctx.switchToHttp().getRequest<{
      user?: AuthenticatedUser
    }>()

    const user = request.user

    if (!user) return null

    return data ? user[data] : user
  },
)
