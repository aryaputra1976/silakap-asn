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

import { JenisPegawaiService } from './jenis-pegawai.service'
import { CreateJenisPegawaiDto } from './dto/create-jenis-pegawai.dto'
import { UpdateJenisPegawaiDto } from './dto/update-jenis-pegawai.dto'
import { QueryJenisPegawaiDto } from './dto/query-jenis-pegawai.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@ApiTags('Master Jenis Pegawai')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/jenis-pegawai')
export class JenisPegawaiController {
  constructor(private readonly service: JenisPegawaiService) {}

  @Get()
  @Permission('MASTER.JENIS_PEGAWAI.VIEW')
  getList(@Query() query: QueryJenisPegawaiDto) {
    return this.service.getList(query)
  }

  @Get(':id')
  @Permission('MASTER.JENIS_PEGAWAI.VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(BigInt(id))
  }

  @Post()
  @Permission('MASTER.JENIS_PEGAWAI.CREATE')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateJenisPegawaiDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  @Patch(':id')
  @Permission('MASTER.JENIS_PEGAWAI.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateJenisPegawaiDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  @Delete(':id')
  @Permission('MASTER.JENIS_PEGAWAI.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  @Patch(':id/restore')
  @Permission('MASTER.JENIS_PEGAWAI.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }

  @Patch(':id/toggle-active')
  @Permission('MASTER.JENIS_PEGAWAI.UPDATE')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.toggleActive(BigInt(id), userId)
  }
}
