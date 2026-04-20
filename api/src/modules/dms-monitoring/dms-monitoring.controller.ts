import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { memoryStorage } from 'multer'

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'

import { CreateDmsBatchDto } from './dto/create-dms-batch.dto'
import { DmsIdParamDto } from './dto/dms-id-param.dto'
import { ImportDmsDto } from './dto/import-dms.dto'
import { QueryDmsBatchesDto } from './dto/query-dms-batches.dto'
import { QueryDmsDashboardDto } from './dto/query-dms-dashboard.dto'
import { QueryDmsSnapshotsDto } from './dto/query-dms-snapshots.dto'
import { DmsMonitoringService } from './dms-monitoring.service'

type DmsRequestUser = {
  id?: bigint | string | null
}

type DmsRequest = Request & {
  user?: DmsRequestUser
}

@ApiTags('DMS Monitoring')
@UseGuards(JwtAuthGuard)
@Controller('dms-monitoring')
export class DmsMonitoringController {
  constructor(
    private readonly service: DmsMonitoringService,
  ) {}

  @Post('batches')
  async createBatch(
    @Body() body: CreateDmsBatchDto,
    @Req() req: DmsRequest,
  ) {
    return this.service.createBatch(body, req.user?.id)
  }

  @Post('import')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async importFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ImportDmsDto,
    @Req() req: DmsRequest,
  ) {
    return this.service.importFile(file, body, req.user?.id)
  }

  @Get('batches')
  async getBatches(@Query() query: QueryDmsBatchesDto) {
    return this.service.getBatches(query)
  }

  @Get('batches/:id')
  async getBatchById(@Param() params: DmsIdParamDto) {
    return this.service.getBatchById(params.id)
  }

  @Get('batches/:id/summary')
  async getBatchSummary(@Param() params: DmsIdParamDto) {
    return this.service.getBatchSummary(params.id)
  }

  @Get('snapshots')
  async getSnapshots(@Query() query: QueryDmsSnapshotsDto) {
    return this.service.getSnapshots(query)
  }

  @Get('dashboard')
  async getDashboard(@Query() query: QueryDmsDashboardDto) {
    return this.service.getDashboard(query.unorId)
  }
}
