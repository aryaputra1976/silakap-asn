import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Query,
} from '@nestjs/common'
import { UserService } from './user.service'
import { CurrentUser } from '@/core/decorators/current-user.decorator'
import { AuthenticatedUser } from '@/modules/auth/strategies/jwt.strategy'
import { UpdateMyProfileDto } from './dto/update-my-profile.dto'
import { ChangePasswordDto } from './dto/change-password.dto'
import { SwaggerAuth } from '@/core/decorators/swagger-auth.decorator'
import { BusinessException } from '@/core/exceptions'
import { RegistrationStatusQueryDto } from './dto/registration-status-query.dto'
import { ReviewRegistrationDto } from './dto/review-registration.dto'
import { QueryUserListDto } from './dto/query-user-list.dto'
import { QueryUserOptionsDto } from './dto/query-user-options.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { ToggleUserStatusDto } from './dto/toggle-user-status.dto'

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

  @Get()
  async getUserList(@Query() query: QueryUserListDto) {
    return this.userService.getUserList(query)
  }

  @Get('options/roles')
  async getRoleOptions() {
    return this.userService.getRoleOptions()
  }

  @Get('options/pegawai')
  async getPegawaiOptions(@Query() query: QueryUserOptionsDto) {
    return this.userService.getPegawaiOptions(query)
  }

  @Get('registrations')
  async getRegistrationQueue(
    @Query() query: RegistrationStatusQueryDto,
  ) {
    return this.userService.getRegistrationQueue(query)
  }

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto)
  }

  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUser(BigInt(id), dto)
  }

  @Patch(':id/status')
  async toggleUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ToggleUserStatusDto,
  ) {
    return this.userService.toggleUserStatus(BigInt(id), dto.isActive)
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(BigInt(id))
  }

  @Patch('registrations/:id/approve')
  async approveRegistration(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewRegistrationDto,
  ) {
    return this.userService.approveRegistration(
      BigInt(id),
      user.id,
      dto.note,
    )
  }

  @Patch('registrations/:id/reject')
  async rejectRegistration(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewRegistrationDto,
  ) {
    return this.userService.rejectRegistration(
      BigInt(id),
      user.id,
      dto.note,
    )
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
