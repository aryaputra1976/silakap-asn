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

import { TempatLahirService } from './tempat-lahir.service'
import { CreateTempatLahirDto } from './dto/create-tempat-lahir.dto'
import { UpdateTempatLahirDto } from './dto/update-tempat-lahir.dto'
import { QueryTempatLahirDto } from './dto/query-tempat-lahir.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@ApiTags('Master Tempat Lahir')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/tempat-lahir')
export class TempatLahirController {
  constructor(private readonly service: TempatLahirService) {}

  @Get()
  @Permission('MASTER.TEMPAT_LAHIR.VIEW')
  getList(@Query() query: QueryTempatLahirDto) {
    return this.service.getList(query)
  }

  @Get(':id')
  @Permission('MASTER.TEMPAT_LAHIR.VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(BigInt(id))
  }

  @Post()
  @Permission('MASTER.TEMPAT_LAHIR.CREATE')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateTempatLahirDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  @Patch(':id')
  @Permission('MASTER.TEMPAT_LAHIR.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTempatLahirDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  @Delete(':id')
  @Permission('MASTER.TEMPAT_LAHIR.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  @Patch(':id/restore')
  @Permission('MASTER.TEMPAT_LAHIR.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }

  @Patch(':id/toggle-active')
  @Permission('MASTER.TEMPAT_LAHIR.UPDATE')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.toggleActive(BigInt(id), userId)
  }
}
