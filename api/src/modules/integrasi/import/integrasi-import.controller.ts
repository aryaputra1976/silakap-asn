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
import {
  QueryImportBatchDto,
  QueryImportErrorsDto,
} from './dto/query-import-batch.dto';
import { IntegrasiImportService } from './integrasi-import.service';

@Controller('integrasi/import/pegawai')
@UseGuards(JwtAuthGuard)
export class IntegrasiImportController {
  constructor(private readonly service: IntegrasiImportService) {}

  @Get('batches')
  findBatches(@Query() query: QueryImportBatchDto) {
    return this.service.findBatches(query);
  }

  @Get('batches/:batchId')
  findBatchDetail(@Param('batchId', ParseIntPipe) batchId: number) {
    return this.service.findBatchDetail(BigInt(batchId));
  }

  @Get('batches/:batchId/errors')
  findErrorRows(
    @Param('batchId', ParseIntPipe) batchId: number,
    @Query() query: QueryImportErrorsDto,
  ) {
    return this.service.findErrorRows(BigInt(batchId), query);
  }

  @Get('batches/:batchId/missing-references')
  findMissingReferences(@Param('batchId', ParseIntPipe) batchId: number) {
    return this.service.findMissingReferences(BigInt(batchId));
  }

  @Post('batches/:batchId/validate')
  validateBatch(@Param('batchId', ParseIntPipe) batchId: number) {
    return this.service.validateBatch(BigInt(batchId));
  }

  @Post('batches/:batchId/commit')
  commitBatch(@Param('batchId', ParseIntPipe) batchId: number) {
    return this.service.commitBatch(BigInt(batchId));
  }

  @Post('batches/:batchId/cancel')
  cancelBatch(@Param('batchId', ParseIntPipe) batchId: number) {
    return this.service.cancelBatch(BigInt(batchId));
  }

  @Post('batches/:batchId/references/jabatan')
  createMissingJabatanReferences(
    @Param('batchId', ParseIntPipe) batchId: number,
  ) {
    return this.service.createMissingReferences(BigInt(batchId), 'jabatan');
  }

  @Post('batches/:batchId/references/unor')
  createMissingUnorReferences(
    @Param('batchId', ParseIntPipe) batchId: number,
  ) {
    return this.service.createMissingReferences(BigInt(batchId), 'unor');
  }

  @Post('batches/:batchId/references/pendidikan')
  createMissingPendidikanReferences(
    @Param('batchId', ParseIntPipe) batchId: number,
  ) {
    return this.service.createMissingReferences(BigInt(batchId), 'pendidikan');
  }
}