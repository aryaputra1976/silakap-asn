import { Controller, Get, Patch, Body } from '@nestjs/common'
import { UserService } from './user.service'
import { CurrentUser } from '@/core/decorators/current-user.decorator'
import { AuthenticatedUser } from '@/modules/auth/strategies/jwt.strategy'
import { UpdateMyProfileDto } from './dto/update-my-profile.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { SwaggerAuth } from '@/core/decorators/swagger-auth.decorator'
import { BusinessException } from '@/core/exceptions'

@Controller('users')
@SwaggerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    if (!user?.id) {
      throw new BusinessException('User tidak valid')
    }
    return this.userService.getMyProfile(user.id)
  }

  @Patch('me')
  async updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateMyProfileDto,
  ) {
    return this.userService.updateMyProfile(user.id, dto)
  }

  @Patch('me/change-password')
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(user.id, dto)
  }
}