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

import { JabatanService } from './jabatan.service'
import { CreateJabatanDto } from './dto/create-jabatan.dto'
import { UpdateJabatanDto } from './dto/update-jabatan.dto'
import { QueryJabatanDto } from './dto/query-jabatan.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@ApiTags('Master Jabatan')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/jabatan')
export class JabatanController {
  constructor(private readonly service: JabatanService) {}

  @Get()
  @Permission('MASTER.JABATAN.VIEW')
  getList(@Query() query: QueryJabatanDto) {
    return this.service.getList(query)
  }

  @Get(':id')
  @Permission('MASTER.JABATAN.VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(BigInt(id))
  }

  @Post()
  @Permission('MASTER.JABATAN.CREATE')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateJabatanDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  @Patch(':id')
  @Permission('MASTER.JABATAN.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateJabatanDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  @Delete(':id')
  @Permission('MASTER.JABATAN.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  @Patch(':id/restore')
  @Permission('MASTER.JABATAN.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }

  @Patch(':id/toggle-active')
  @Permission('MASTER.JABATAN.UPDATE')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.toggleActive(BigInt(id), userId)
  }
}
