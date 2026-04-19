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

import { JenisKelaminService } from './jenis-kelamin.service'
import { CreateJenisKelaminDto } from './dto/create-jenis-kelamin.dto'
import { UpdateJenisKelaminDto } from './dto/update-jenis-kelamin.dto'
import { QueryJenisKelaminDto } from './dto/query-jenis-kelamin.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@ApiTags('Master Jenis Kelamin')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/jenis-kelamin')
export class JenisKelaminController {
  constructor(private readonly service: JenisKelaminService) {}

  @Get()
  @Permission('MASTER.JENIS_KELAMIN.VIEW')
  getList(@Query() query: QueryJenisKelaminDto) {
    return this.service.getList(query)
  }

  @Get(':id')
  @Permission('MASTER.JENIS_KELAMIN.VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(BigInt(id))
  }

  @Post()
  @Permission('MASTER.JENIS_KELAMIN.CREATE')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateJenisKelaminDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  @Patch(':id')
  @Permission('MASTER.JENIS_KELAMIN.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateJenisKelaminDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  @Delete(':id')
  @Permission('MASTER.JENIS_KELAMIN.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  @Patch(':id/restore')
  @Permission('MASTER.JENIS_KELAMIN.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }

  @Patch(':id/toggle-active')
  @Permission('MASTER.JENIS_KELAMIN.UPDATE')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.toggleActive(BigInt(id), userId)
  }
}
