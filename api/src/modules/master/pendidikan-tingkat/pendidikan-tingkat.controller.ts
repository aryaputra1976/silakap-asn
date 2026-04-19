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

import { PendidikanTingkatService } from './pendidikan-tingkat.service'
import { CreatePendidikanTingkatDto } from './dto/create-pendidikan-tingkat.dto'
import { UpdatePendidikanTingkatDto } from './dto/update-pendidikan-tingkat.dto'
import { QueryPendidikanTingkatDto } from './dto/query-pendidikan-tingkat.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@ApiTags('Master Pendidikan Tingkat')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/pendidikan-tingkat')
export class PendidikanTingkatController {
  constructor(private readonly service: PendidikanTingkatService) {}

  // ================= LIST =================
  @Get()
  @Permission('MASTER.PENDIDIKAN_TINGKAT.VIEW')
  getList(@Query() query: QueryPendidikanTingkatDto) {
    return this.service.getList(query)
  }

  // ================= DETAIL =================
  @Get(':id')
  @Permission('MASTER.PENDIDIKAN_TINGKAT.VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(BigInt(id))
  }

  // ================= CREATE =================
  @Post()
  @Permission('MASTER.PENDIDIKAN_TINGKAT.CREATE')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreatePendidikanTingkatDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  // ================= UPDATE =================
  @Patch(':id')
  @Permission('MASTER.PENDIDIKAN_TINGKAT.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePendidikanTingkatDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  // ================= DELETE (SOFT) =================
  @Delete(':id')
  @Permission('MASTER.PENDIDIKAN_TINGKAT.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  // ================= RESTORE =================
  @Patch(':id/restore')
  @Permission('MASTER.PENDIDIKAN_TINGKAT.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }

  // ================= TOGGLE ACTIVE =================
  @Patch(':id/toggle-active')
  @Permission('MASTER.PENDIDIKAN_TINGKAT.UPDATE')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.toggleActive(BigInt(id), userId)
  }
}
