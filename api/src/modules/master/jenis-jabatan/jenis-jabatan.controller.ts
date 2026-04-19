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

import { JenisJabatanService } from './jenis-jabatan.service'
import { CreateJenisJabatanDto } from './dto/create-jenis-jabatan.dto'
import { UpdateJenisJabatanDto } from './dto/update-jenis-jabatan.dto'
import { QueryJenisJabatanDto } from './dto/query-jenis-jabatan.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@ApiTags('Master Jenis Jabatan')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/jenis-jabatan')
export class JenisJabatanController {
  constructor(private readonly service: JenisJabatanService) {}

  @Get()
  @Permission('MASTER.JENIS_JABATAN.VIEW')
  getList(@Query() query: QueryJenisJabatanDto) {
    return this.service.getList(query)
  }

  @Get(':id')
  @Permission('MASTER.JENIS_JABATAN.VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(BigInt(id))
  }

  @Post()
  @Permission('MASTER.JENIS_JABATAN.CREATE')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateJenisJabatanDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  @Patch(':id')
  @Permission('MASTER.JENIS_JABATAN.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateJenisJabatanDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  @Delete(':id')
  @Permission('MASTER.JENIS_JABATAN.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  @Patch(':id/restore')
  @Permission('MASTER.JENIS_JABATAN.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }

  @Patch(':id/toggle-active')
  @Permission('MASTER.JENIS_JABATAN.UPDATE')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.toggleActive(BigInt(id), userId)
  }
}
