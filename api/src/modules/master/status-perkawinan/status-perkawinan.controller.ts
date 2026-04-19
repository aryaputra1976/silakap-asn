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

import { StatusPerkawinanService } from './status-perkawinan.service'
import { CreateStatusPerkawinanDto } from './dto/create-status-perkawinan.dto'
import { UpdateStatusPerkawinanDto } from './dto/update-status-perkawinan.dto'
import { QueryStatusPerkawinanDto } from './dto/query-status-perkawinan.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@ApiTags('Master Status Perkawinan')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/status-perkawinan')
export class StatusPerkawinanController {
  constructor(private readonly service: StatusPerkawinanService) {}

  @Get()
  @Permission('MASTER.STATUS_PERKAWINAN.VIEW')
  getList(@Query() query: QueryStatusPerkawinanDto) {
    return this.service.getList(query)
  }

  @Get(':id')
  @Permission('MASTER.STATUS_PERKAWINAN.VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(BigInt(id))
  }

  @Post()
  @Permission('MASTER.STATUS_PERKAWINAN.CREATE')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateStatusPerkawinanDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  @Patch(':id')
  @Permission('MASTER.STATUS_PERKAWINAN.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStatusPerkawinanDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  @Delete(':id')
  @Permission('MASTER.STATUS_PERKAWINAN.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  @Patch(':id/restore')
  @Permission('MASTER.STATUS_PERKAWINAN.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }

  @Patch(':id/toggle-active')
  @Permission('MASTER.STATUS_PERKAWINAN.UPDATE')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.toggleActive(BigInt(id), userId)
  }
}
