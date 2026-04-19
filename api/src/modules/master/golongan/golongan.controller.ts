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

import { GolonganService } from './golongan.service'
import { CreateGolonganDto } from './dto/create-golongan.dto'
import { UpdateGolonganDto } from './dto/update-golongan.dto'
import { QueryGolonganDto } from './dto/query-golongan.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@ApiTags('Master Golongan')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/golongan')
export class GolonganController {
  constructor(private readonly service: GolonganService) {}

  // ================= LIST =================
  @Get()
  @Permission('MASTER.GOLONGAN.VIEW')
  getList(@Query() query: QueryGolonganDto) {
    return this.service.getList(query)
  }

  // ================= DETAIL =================
  @Get(':id')
  @Permission('MASTER.GOLONGAN.VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(BigInt(id))
  }

  // ================= CREATE =================
  @Post()
  @Permission('MASTER.GOLONGAN.CREATE')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateGolonganDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  // ================= UPDATE =================
  @Patch(':id')
  @Permission('MASTER.GOLONGAN.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGolonganDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  // ================= DELETE (SOFT DELETE) =================
  @Delete(':id')
  @Permission('MASTER.GOLONGAN.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  // ================= RESTORE =================
  @Patch(':id/restore')
  @Permission('MASTER.GOLONGAN.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }

  // ================= TOGGLE ACTIVE =================
  @Patch(':id/toggle-active')
  @Permission('MASTER.GOLONGAN.UPDATE')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.toggleActive(BigInt(id), userId)
  }
}
