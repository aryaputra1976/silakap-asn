import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  QueryIntegrasiLogRowsDto,
  QueryIntegrasiLogsDto,
} from './dto/query-integrasi-logs.dto';
import { IntegrasiLogsService } from './integrasi-logs.service';

@Controller('integrasi/logs')
@UseGuards(JwtAuthGuard)
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