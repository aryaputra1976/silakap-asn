import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../core/decorators/roles.decorator';
import { Role } from '../../../core/enums/roles.enum';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { QueryIntegrasiJobsDto } from './dto/query-integrasi-jobs.dto';
import { IntegrasiJobsService } from './integrasi-jobs.service';

@Controller('integrasi/jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN_BKPSDM, Role.SUPER_ADMIN)
export class IntegrasiJobsController {
  constructor(private readonly service: IntegrasiJobsService) {}

  @Get()
  findJobs(@Query() query: QueryIntegrasiJobsDto) {
    return this.service.findJobs(query);
  }

  @Get('summary')
  getSummary() {
    return this.service.getSummary();
  }

  @Get(':batchId')
  findJobDetail(@Param('batchId', ParseIntPipe) batchId: number) {
    return this.service.findJobDetail(BigInt(batchId));
  }

  @Post('import-batches/:batchId/validate')
  runValidateJob(@Param('batchId', ParseIntPipe) batchId: number) {
    return this.service.runValidateJob(BigInt(batchId));
  }

  @Post('import-batches/:batchId/commit')
  runCommitJob(@Param('batchId', ParseIntPipe) batchId: number) {
    return this.service.runCommitJob(BigInt(batchId));
  }

  @Post('import-batches/:batchId/cancel')
  runCancelJob(@Param('batchId', ParseIntPipe) batchId: number) {
    return this.service.runCancelJob(BigInt(batchId));
  }
}
