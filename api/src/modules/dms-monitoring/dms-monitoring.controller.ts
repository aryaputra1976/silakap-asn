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

import { AllowDmsRoles } from './dms-monitoring-access.decorator'
import { DmsMonitoringAccessGuard } from './dms-monitoring-access.guard'
import { CreateDmsBatchDto } from './dto/create-dms-batch.dto'
import { DmsIdParamDto } from './dto/dms-id-param.dto'
import { ImportDmsDto } from './dto/import-dms.dto'
import { QueryDmsBatchesDto } from './dto/query-dms-batches.dto'
import { QueryDmsDashboardDto } from './dto/query-dms-dashboard.dto'
import { QueryDmsSnapshotsDto } from './dto/query-dms-snapshots.dto'
import { DmsMonitoringService } from './dms-monitoring.service'

const DMS_MANAGE_ROLES = [
  'SUPER_ADMIN',
  'ADMIN_BKPSDM',
  'OPERATOR',
]

const DMS_READ_ROLES = [
  'SUPER_ADMIN',
  'ADMIN_BKPSDM',
  'VERIFIKATOR',
  'PPK',
  'OPERATOR',
]

type DmsRequestUser = {
  id?: bigint | string | null
  role?: string | null
  roles?: string[]
  unitKerjaId?: string | null
}

type DmsRequest = Request & {
  user?: DmsRequestUser
}

@ApiTags('DMS Monitoring')
@UseGuards(JwtAuthGuard, DmsMonitoringAccessGuard)
@Controller('dms-monitoring')
export class DmsMonitoringController {
  constructor(
    private readonly service: DmsMonitoringService,
  ) {}

  @Post('batches')
  @AllowDmsRoles(...DMS_MANAGE_ROLES)
  async createBatch(
    @Body() body: CreateDmsBatchDto,
    @Req() req: DmsRequest,
  ) {
    return this.service.createBatch(body, req.user)
  }

  @Post('import')
  @ApiConsumes('multipart/form-data')
  @AllowDmsRoles(...DMS_MANAGE_ROLES)
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
    return this.service.importFile(file, body, req.user)
  }

  @Get('batches')
  @AllowDmsRoles(...DMS_READ_ROLES)
  async getBatches(
    @Query() query: QueryDmsBatchesDto,
    @Req() req: DmsRequest,
  ) {
    return this.service.getBatches(query, req.user)
  }

  @Get('batches/:id')
  @AllowDmsRoles(...DMS_READ_ROLES)
  async getBatchById(
    @Param() params: DmsIdParamDto,
    @Req() req: DmsRequest,
  ) {
    return this.service.getBatchById(params.id, req.user)
  }

  @Get('batches/:id/summary')
  @AllowDmsRoles(...DMS_READ_ROLES)
  async getBatchSummary(
    @Param() params: DmsIdParamDto,
    @Req() req: DmsRequest,
  ) {
    return this.service.getBatchSummary(params.id, req.user)
  }

  @Get('snapshots')
  @AllowDmsRoles(...DMS_READ_ROLES)
  async getSnapshots(
    @Query() query: QueryDmsSnapshotsDto,
    @Req() req: DmsRequest,
  ) {
    return this.service.getSnapshots(query, req.user)
  }

  @Get('dashboard')
  @AllowDmsRoles(...DMS_READ_ROLES)
  async getDashboard(
    @Query() query: QueryDmsDashboardDto,
    @Req() req: DmsRequest,
  ) {
    return this.service.getDashboard(query.unorId, req.user)
  }
}
