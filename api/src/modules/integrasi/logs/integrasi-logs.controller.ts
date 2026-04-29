import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { Role } from '../../../core/enums/roles.enum';
import { RolesGuard } from '../../../core/guards/roles.guard';
import {
  QueryIntegrasiLogRowsDto,
  QueryIntegrasiLogsDto,
} from './dto/query-integrasi-logs.dto';
import { IntegrasiLogsService } from './integrasi-logs.service';

@Controller('integrasi/logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN_BKPSDM, Role.SUPER_ADMIN)
export class IntegrasiLogsController {
  constructor(private readonly service: IntegrasiLogsService) {}

  @Get()
  findLogs(@Query() query: QueryIntegrasiLogsDto) {
    return this.service.findLogs(query);
  }

  @Get('summary')
  getSummary() {
    return this.service.getSummary();
  }

  @Get('export')
  async exportLogs(
    @Query() query: QueryIntegrasiLogsDto,
    @Res() response: Response,
  ) {
    const result = await this.service.exportLogsCsv(query);

    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );
    response.send(result.csv);
  }

  @Get(':id')
  findLogDetail(@Param('id', ParseIntPipe) id: number) {
    return this.service.findLogDetail(BigInt(id));
  }

  @Get(':id/rows')
  findLogRows(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: QueryIntegrasiLogRowsDto,
  ) {
    return this.service.findLogRows(BigInt(id), query);
  }
}
