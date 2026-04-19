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

import { PendidikanService } from './pendidikan.service'
import { CreatePendidikanDto } from './dto/create-pendidikan.dto'
import { UpdatePendidikanDto } from './dto/update-pendidikan.dto'
import { QueryPendidikanDto } from './dto/query-pendidikan.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@ApiTags('Master Pendidikan')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/pendidikan')
export class PendidikanController {
  constructor(private readonly service: PendidikanService) {}

  @Get()
  @Permission('MASTER.PENDIDIKAN.VIEW')
  getList(@Query() query: QueryPendidikanDto) {
    return this.service.getList(query)
  }

  @Get(':id')
  @Permission('MASTER.PENDIDIKAN.VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(BigInt(id))
  }

  @Post()
  @Permission('MASTER.PENDIDIKAN.CREATE')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreatePendidikanDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  @Patch(':id')
  @Permission('MASTER.PENDIDIKAN.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePendidikanDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  @Delete(':id')
  @Permission('MASTER.PENDIDIKAN.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  @Patch(':id/restore')
  @Permission('MASTER.PENDIDIKAN.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }

  @Patch(':id/toggle-active')
  @Permission('MASTER.PENDIDIKAN.UPDATE')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.toggleActive(BigInt(id), userId)
  }
}
