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

import { StatusKepegawaianService } from './status-kepegawaian.service'
import { CreateStatusKepegawaianDto } from './dto/create-status-kepegawaian.dto'
import { UpdateStatusKepegawaianDto } from './dto/update-status-kepegawaian.dto'
import { QueryStatusKepegawaianDto } from './dto/query-status-kepegawaian.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@ApiTags('Master Status Kepegawaian')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/status-kepegawaian')
export class StatusKepegawaianController {
  constructor(private readonly service: StatusKepegawaianService) {}

  @Get()
  @Permission('MASTER.STATUS_KEPEGAWAIAN.VIEW')
  getList(@Query() query: QueryStatusKepegawaianDto) {
    return this.service.getList(query)
  }

  @Get(':id')
  @Permission('MASTER.STATUS_KEPEGAWAIAN.VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(BigInt(id))
  }

  @Post()
  @Permission('MASTER.STATUS_KEPEGAWAIAN.CREATE')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateStatusKepegawaianDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  @Patch(':id')
  @Permission('MASTER.STATUS_KEPEGAWAIAN.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStatusKepegawaianDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  @Delete(':id')
  @Permission('MASTER.STATUS_KEPEGAWAIAN.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  @Patch(':id/restore')
  @Permission('MASTER.STATUS_KEPEGAWAIAN.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }

  @Patch(':id/toggle-active')
  @Permission('MASTER.STATUS_KEPEGAWAIAN.UPDATE')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.toggleActive(BigInt(id), userId)
  }
}
