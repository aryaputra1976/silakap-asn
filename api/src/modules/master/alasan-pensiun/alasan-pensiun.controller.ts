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

import { AlasanPensiunService } from './alasan-pensiun.service'
import { CreateAlasanPensiunDto } from './dto/create-alasan-pensiun.dto'
import { UpdateAlasanPensiunDto } from './dto/update-alasan-pensiun.dto'
import { QueryAlasanPensiunDto } from './dto/query-alasan-pensiun.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@ApiTags('Master Alasan Pensiun')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/alasan-pensiun')
export class AlasanPensiunController {
  constructor(private readonly service: AlasanPensiunService) {}

  @Get()
  @Permission('MASTER.ALASAN_PENSIUN.VIEW')
  getList(@Query() query: QueryAlasanPensiunDto) {
    return this.service.getList(query)
  }

  @Get(':id')
  @Permission('MASTER.ALASAN_PENSIUN.VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(BigInt(id))
  }

  @Post()
  @Permission('MASTER.ALASAN_PENSIUN.CREATE')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateAlasanPensiunDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  @Patch(':id')
  @Permission('MASTER.ALASAN_PENSIUN.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAlasanPensiunDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  @Delete(':id')
  @Permission('MASTER.ALASAN_PENSIUN.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  @Patch(':id/restore')
  @Permission('MASTER.ALASAN_PENSIUN.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }

  @Patch(':id/toggle-active')
  @Permission('MASTER.ALASAN_PENSIUN.UPDATE')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.toggleActive(BigInt(id), userId)
  }
}
