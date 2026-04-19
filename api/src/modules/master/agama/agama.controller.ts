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

import { AgamaService } from './agama.service'
import { CreateAgamaDto } from './dto/create-agama.dto'
import { UpdateAgamaDto } from './dto/update-agama.dto'
import { QueryAgamaDto } from './dto/query-agama.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@ApiTags('Master Agama')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/agama')
export class AgamaController {
  constructor(private readonly service: AgamaService) {}

  @Get()
  @Permission('MASTER.AGAMA.VIEW')
  getList(@Query() query: QueryAgamaDto) {
    return this.service.getList(query)
  }

  @Get(':id')
  @Permission('MASTER.AGAMA.VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(BigInt(id))
  }

  @Post()
  @Permission('MASTER.AGAMA.CREATE')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateAgamaDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  @Patch(':id')
  @Permission('MASTER.AGAMA.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAgamaDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  @Delete(':id')
  @Permission('MASTER.AGAMA.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  @Patch(':id/restore')
  @Permission('MASTER.AGAMA.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }

  @Patch(':id/toggle-active')
  @Permission('MASTER.AGAMA.UPDATE')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.toggleActive(BigInt(id), userId)
  }
}
