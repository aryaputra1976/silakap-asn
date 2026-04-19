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

import { KpknService } from './kpkn.service'
import { CreateKpknDto } from './dto/create-kpkn.dto'
import { UpdateKpknDto } from './dto/update-kpkn.dto'
import { QueryKpknDto } from './dto/query-kpkn.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@ApiTags('Master KPKN')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/kpkn')
export class KpknController {
  constructor(private readonly service: KpknService) {}

  @Get()
  @Permission('MASTER.KPKN.VIEW')
  getList(@Query() query: QueryKpknDto) {
    return this.service.getList(query)
  }

  @Get(':id')
  @Permission('MASTER.KPKN.VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(BigInt(id))
  }

  @Post()
  @Permission('MASTER.KPKN.CREATE')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateKpknDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  @Patch(':id')
  @Permission('MASTER.KPKN.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateKpknDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  @Delete(':id')
  @Permission('MASTER.KPKN.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  @Patch(':id/restore')
  @Permission('MASTER.KPKN.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }

  @Patch(':id/toggle-active')
  @Permission('MASTER.KPKN.UPDATE')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.toggleActive(BigInt(id), userId)
  }
}
