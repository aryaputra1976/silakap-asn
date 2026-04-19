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

import { InstansiService } from './instansi.service'
import { CreateInstansiDto } from './dto/create-instansi.dto'
import { UpdateInstansiDto } from './dto/update-instansi.dto'
import { QueryInstansiDto } from './dto/query-instansi.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@ApiTags('Master Instansi')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/instansi')
export class InstansiController {
  constructor(private readonly service: InstansiService) {}

  // ================= LIST =================
  @Get()
  @Permission('MASTER.INSTANSI.VIEW')
  getList(@Query() query: QueryInstansiDto) {
    return this.service.getList(query)
  }

  // ================= DETAIL =================
  @Get(':id')
  @Permission('MASTER.INSTANSI.VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(BigInt(id))
  }

  // ================= CREATE =================
  @Post()
  @Permission('MASTER.INSTANSI.CREATE')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateInstansiDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  // ================= UPDATE =================
  @Patch(':id')
  @Permission('MASTER.INSTANSI.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateInstansiDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  // ================= DELETE (SOFT) =================
  @Delete(':id')
  @Permission('MASTER.INSTANSI.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  // ================= RESTORE =================
  @Patch(':id/restore')
  @Permission('MASTER.INSTANSI.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }

  // ================= TOGGLE ACTIVE =================
  @Patch(':id/toggle-active')
  @Permission('MASTER.INSTANSI.UPDATE')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.toggleActive(BigInt(id), userId)
  }
}
