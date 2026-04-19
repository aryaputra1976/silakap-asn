import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { __PASCAL__Service } from './__KEBAB__.service'
import { Create__PASCAL__Dto } from './dto/create-__KEBAB__.dto'
import { Update__PASCAL__Dto } from './dto/update-__KEBAB__.dto'
import { Query__PASCAL__Dto } from './dto/query-__KEBAB__.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator'

@ApiTags('Master __PASCAL__')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/__KEBAB__')
export class __PASCAL__Controller {
  constructor(private readonly service: __PASCAL__Service) {}

  @Get()
  @Permission('MASTER.__UPPER__.VIEW')
  getList(@Query() query: Query__PASCAL__Dto) {
    return this.service.getList(query)
  }

  @Get(':id')
  @Permission('MASTER.__UPPER__.VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(BigInt(id))
  }

  @Post()
  @Permission('MASTER.__UPPER__.CREATE')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: Create__PASCAL__Dto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  @Patch(':id')
  @Permission('MASTER.__UPPER__.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: Update__PASCAL__Dto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  @Delete(':id')
  @Permission('MASTER.__UPPER__.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  @Patch(':id/restore')
  @Permission('MASTER.__UPPER__.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }
}