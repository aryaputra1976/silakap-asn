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

import { SatkerService } from './satker.service'
import { CreateSatkerDto } from './dto/create-satker.dto'
import { UpdateSatkerDto } from './dto/update-satker.dto'
import { QuerySatkerDto } from './dto/query-satker.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@ApiTags('Master Satker')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/satker')
export class SatkerController {
  constructor(private readonly service: SatkerService) {}

  @Get()
  @Permission('MASTER.SATKER.VIEW')
  getList(@Query() query: QuerySatkerDto) {
    return this.service.getList(query)
  }

  @Get(':id')
  @Permission('MASTER.SATKER.VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(BigInt(id))
  }

  @Post()
  @Permission('MASTER.SATKER.CREATE')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateSatkerDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  @Patch(':id')
  @Permission('MASTER.SATKER.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSatkerDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  @Delete(':id')
  @Permission('MASTER.SATKER.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  @Patch(':id/restore')
  @Permission('MASTER.SATKER.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }

  @Patch(':id/toggle-active')
  @Permission('MASTER.SATKER.UPDATE')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.toggleActive(BigInt(id), userId)
  }
}
