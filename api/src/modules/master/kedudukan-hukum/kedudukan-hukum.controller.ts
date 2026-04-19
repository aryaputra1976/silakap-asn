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

import { KedudukanHukumService } from './kedudukan-hukum.service'
import { CreateKedudukanHukumDto } from './dto/create-kedudukan-hukum.dto'
import { UpdateKedudukanHukumDto } from './dto/update-kedudukan-hukum.dto'
import { QueryKedudukanHukumDto } from './dto/query-kedudukan-hukum.dto'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { PermissionGuard } from '@/modules/auth/guards/permission.guard'
import { Permission } from '@/modules/auth/decorators/permission.decorator'
import { CurrentUser } from '@/core/decorators/current-user.decorator'

@ApiTags('Master Kedudukan Hukum')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Controller('master/kedudukan-hukum')
export class KedudukanHukumController {
  constructor(private readonly service: KedudukanHukumService) {}

  @Get()
  @Permission('MASTER.KEDUDUKAN_HUKUM.VIEW')
  getList(@Query() query: QueryKedudukanHukumDto) {
    return this.service.getList(query)
  }

  @Get(':id')
  @Permission('MASTER.KEDUDUKAN_HUKUM.VIEW')
  getById(@Param('id') id: string) {
    return this.service.getById(BigInt(id))
  }

  @Post()
  @Permission('MASTER.KEDUDUKAN_HUKUM.CREATE')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateKedudukanHukumDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.create(dto, userId)
  }

  @Patch(':id')
  @Permission('MASTER.KEDUDUKAN_HUKUM.UPDATE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateKedudukanHukumDto,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.update(BigInt(id), dto, userId)
  }

  @Delete(':id')
  @Permission('MASTER.KEDUDUKAN_HUKUM.DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.remove(BigInt(id), userId)
  }

  @Patch(':id/restore')
  @Permission('MASTER.KEDUDUKAN_HUKUM.RESTORE')
  restore(@Param('id') id: string) {
    return this.service.restore(BigInt(id))
  }

  @Patch(':id/toggle-active')
  @Permission('MASTER.KEDUDUKAN_HUKUM.UPDATE')
  toggleActive(
    @Param('id') id: string,
    @CurrentUser('id') userId: bigint
  ) {
    return this.service.toggleActive(BigInt(id), userId)
  }
}
