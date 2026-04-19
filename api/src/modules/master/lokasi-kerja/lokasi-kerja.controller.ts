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

import { LokasiKerjaService } from './lokasi-kerja.service'
import { CreateLokasiKerjaDto } from './dto/create-lokasi-kerja.dto'
import { UpdateLokasiKerjaDto } from './dto/update-lokasi-kerja.dto'
import { QueryLokasiKerjaDto } from './dto/query-lokasi-kerja.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@ApiTags('Master Lokasi Kerja')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/lokasi-kerja')
export class LokasiKerjaController {
  constructor(private readonly service: LokasiKerjaService) {}

  @Get()
  @Permission('MASTER.LOKASI_KERJA.VIEW')
  getList(@Query() query: QueryLokasiKerjaDto) {
    return this.service.getList(query)
  }

  @Get(':id')
  @Permission('MASTER.LOKASI_KERJA.VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(BigInt(id))
  }

  @Post()
  @Permission('MASTER.LOKASI_KERJA.CREATE')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateLokasiKerjaDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  @Patch(':id')
  @Permission('MASTER.LOKASI_KERJA.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLokasiKerjaDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  @Delete(':id')
  @Permission('MASTER.LOKASI_KERJA.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  @Patch(':id/restore')
  @Permission('MASTER.LOKASI_KERJA.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }

  @Patch(':id/toggle-active')
  @Permission('MASTER.LOKASI_KERJA.UPDATE')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.toggleActive(BigInt(id), userId)
  }
}
