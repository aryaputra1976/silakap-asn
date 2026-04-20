import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { ApiConsumes, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'

import { DmsMonitoringService } from './dms-monitoring.service'

type DmsRequestUser = {
  id?: bigint | string | null
}

type DmsRequest = Request & {
  user?: DmsRequestUser
}

type CreateDmsBatchBody = {
  namaFile: string
  unorId?: string | number | null
  periodeLabel?: string | null
  catatan?: string | null
}

type ImportDmsBody = {
  unorId?: string | number | null
  periodeLabel?: string | null
  catatan?: string | null
}

@ApiTags('DMS Monitoring')
@Controller('dms-monitoring')
export class DmsMonitoringController {
  constructor(
    private readonly service: DmsMonitoringService,
  ) {}

  @Post('batches')
  async createBatch(
    @Body() body: CreateDmsBatchBody,
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
    @Body() body: ImportDmsBody,
    @Req() req: DmsRequest,
  ) {
    return this.service.importFile(file, body, req.user?.id)
  }

  @Get('batches')
  async getBatches(
    @Query('unorId') unorId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getBatches({
      unorId,
      status,
      page,
      limit,
    })
  }

  @Get('batches/:id')
  async getBatchById(@Param('id') id: string) {
    return this.service.getBatchById(id)
  }

  @Get('batches/:id/summary')
  async getBatchSummary(@Param('id') id: string) {
    return this.service.getBatchSummary(id)
  }

  @Get('snapshots')
  async getSnapshots(
    @Query('batchId') batchId?: string,
    @Query('unorId') unorId?: string,
    @Query('kategori') kategori?: string,
    @Query('nip') nip?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getSnapshots({
      batchId,
      unorId,
      kategori,
      nip,
      page,
      limit,
    })
  }

  @Get('dashboard')
  async getDashboard(@Query('unorId') unorId?: string) {
    return this.service.getDashboard(unorId)
  }
}
