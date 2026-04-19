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

import { JenisLayananService } from './jenis-layanan.service'
import { CreateJenisLayananDto } from './dto/create-jenis-layanan.dto'
import { UpdateJenisLayananDto } from './dto/update-jenis-layanan.dto'
import { QueryJenisLayananDto } from './dto/query-jenis-layanan.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@ApiTags('Master Jenis Layanan')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/jenis-layanan')
export class JenisLayananController {
  constructor(private readonly service: JenisLayananService) {}

  @Get()
  @Permission('MASTER.JENIS_LAYANAN.VIEW')
  getList(@Query() query: QueryJenisLayananDto) {
    return this.service.getList(query)
  }

  @Post()
  @Permission('MASTER.JENIS_LAYANAN.CREATE')
  create(
    @Body() dto: CreateJenisLayananDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  @Patch(':id')
  @Permission('MASTER.JENIS_LAYANAN.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateJenisLayananDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  @Delete(':id')
  @Permission('MASTER.JENIS_LAYANAN.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  @Patch(':id/restore')
  @Permission('MASTER.JENIS_LAYANAN.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }

  @Patch(':id/toggle-active')
  @Permission('MASTER.JENIS_LAYANAN.UPDATE')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.toggleActive(BigInt(id), userId)
  }
}
