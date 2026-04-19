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

import { UnorService } from './unor.service'
import { CreateUnorDto } from './dto/create-unor.dto'
import { UpdateUnorDto } from './dto/update-unor.dto'
import { QueryUnorDto } from './dto/query-unor.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@ApiTags('Master Unor')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/unor')
export class UnorController {
  constructor(private readonly service: UnorService) {}

  @Get()
  @Permission('MASTER.UNOR.VIEW')
  getList(@Query() query: QueryUnorDto) {
    return this.service.getList(query)
  }

  @Get(':id')
  @Permission('MASTER.UNOR.VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(BigInt(id))
  }

  @Post()
  @Permission('MASTER.UNOR.CREATE')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateUnorDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  @Patch(':id')
  @Permission('MASTER.UNOR.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUnorDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  @Delete(':id')
  @Permission('MASTER.UNOR.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  @Patch(':id/restore')
  @Permission('MASTER.UNOR.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }

  @Patch(':id/toggle-active')
  @Permission('MASTER.UNOR.UPDATE')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.toggleActive(BigInt(id), userId)
  }
}
