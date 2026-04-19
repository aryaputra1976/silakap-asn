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

import { JenisPensiunService } from './jenis-pensiun.service'
import { CreateJenisPensiunDto } from './dto/create-jenis-pensiun.dto'
import { UpdateJenisPensiunDto } from './dto/update-jenis-pensiun.dto'
import { QueryJenisPensiunDto } from './dto/query-jenis-pensiun.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@ApiTags('Master Jenis Pensiun')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/jenis-pensiun')
export class JenisPensiunController {
  constructor(private readonly service: JenisPensiunService) {}

  @Get()
  @Permission('MASTER.JENIS_PENSIUN.VIEW')
  getList(@Query() query: QueryJenisPensiunDto) {
    return this.service.getList(query)
  }

  @Get(':id')
  @Permission('MASTER.JENIS_PENSIUN.VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(BigInt(id))
  }

  @Post()
  @Permission('MASTER.JENIS_PENSIUN.CREATE')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateJenisPensiunDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  @Patch(':id')
  @Permission('MASTER.JENIS_PENSIUN.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateJenisPensiunDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  @Delete(':id')
  @Permission('MASTER.JENIS_PENSIUN.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  @Patch(':id/restore')
  @Permission('MASTER.JENIS_PENSIUN.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }

  @Patch(':id/toggle-active')
  @Permission('MASTER.JENIS_PENSIUN.UPDATE')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.toggleActive(BigInt(id), userId)
  }
}
