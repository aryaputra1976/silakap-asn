import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BatchOwnershipGuard } from '../../../shared/guards/batch-ownership.guard';
import { ValidateFileContentPipe } from '../../../shared/decorators/validate-file-content.decorator';
import {
  QueryImportBatchDto,
  QueryImportErrorsDto,
} from './dto/query-import-batch.dto';
import { IntegrasiImportService } from './integrasi-import.service';
import { UpdateImportRowDto } from './dto/update-import-row.dto';

const MAX_UPLOAD_SIZE_BYTES = 15 * 1024 * 1024;

const ALLOWED_EXCEL_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'application/csv',
]);

@Controller('integrasi/import/pegawai')
@UseGuards(JwtAuthGuard)
export class IntegrasiImportController {
  constructor(private readonly service: IntegrasiImportService) {}

  /**
   * Upload file Excel/CSV untuk import pegawai
   * Rate limiting: 5 uploads per 60 seconds per user
   * File validation: magic bytes check (prevent spoofing)
   */
  @Post('upload')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_UPLOAD_SIZE_BYTES,
        files: 1,
      },
      fileFilter: (_request, file, callback) => {
        const filename = file.originalname.toLowerCase();
        const isAllowedExtension =
          filename.endsWith('.xlsx') ||
          filename.endsWith('.xls') ||
          filename.endsWith('.csv');

        const isAllowedMime =
          ALLOWED_EXCEL_MIME_TYPES.has(file.mimetype) ||
          file.mimetype === 'application/octet-stream';

        if (!isAllowedExtension || !isAllowedMime) {
          callback(
            new BadRequestException(
              'File harus berformat .xlsx, .xls, atau .csv',
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  async uploadPegawaiImport(
    @UploadedFile(new ValidateFileContentPipe()) file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('File import wajib diunggah');
    }

    return this.service.uploadPegawaiImport(file, req.user.id);
  }

  @Get('batches')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  findBatches(@Query() query: QueryImportBatchDto) {
    return this.service.findBatches(query);
  }

  @Get('batches/:batchId')
  @UseGuards(BatchOwnershipGuard)
  findBatchDetail(@Param('batchId', ParseIntPipe) batchId: number) {
    return this.service.findBatchDetail(BigInt(batchId));
  }

  @Get('batches/:batchId/errors')
  @UseGuards(BatchOwnershipGuard)
  findErrorRows(
    @Param('batchId', ParseIntPipe) batchId: number,
    @Query() query: QueryImportErrorsDto,
  ) {
    return this.service.findErrorRows(BigInt(batchId), query);
  }

  @Patch('rows/:rowId')
  updateImportRow(
    @Param('rowId', ParseIntPipe) rowId: number,
    @Body() dto: UpdateImportRowDto,
  ) {
    return this.service.updateImportRow(BigInt(rowId), dto);
  }
    
  @Get('batches/:batchId/missing-references')
  @UseGuards(BatchOwnershipGuard)
  findMissingReferences(@Param('batchId', ParseIntPipe) batchId: number) {
    return this.service.findMissingReferences(BigInt(batchId));
  }

  @Post('batches/:batchId/validate')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UseGuards(BatchOwnershipGuard)
  validateBatch(@Param('batchId', ParseIntPipe) batchId: number) {
    return this.service.validateBatch(BigInt(batchId));
  }

  @Post('batches/:batchId/commit')
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @UseGuards(BatchOwnershipGuard)
  commitBatch(@Param('batchId', ParseIntPipe) batchId: number) {
    return this.service.commitBatch(BigInt(batchId));
  }

  @Post('batches/:batchId/cancel')
  @UseGuards(BatchOwnershipGuard)
  cancelBatch(@Param('batchId', ParseIntPipe) batchId: number) {
    return this.service.cancelBatch(BigInt(batchId));
  }

  @Post('batches/:batchId/references/jabatan')
  @UseGuards(BatchOwnershipGuard)
  createMissingJabatanReferences(
    @Param('batchId', ParseIntPipe) batchId: number,
  ) {
    return this.service.createMissingReferences(BigInt(batchId), 'jabatan');
  }

  @Post('batches/:batchId/references/unor')
  @UseGuards(BatchOwnershipGuard)
  createMissingUnorReferences(
    @Param('batchId', ParseIntPipe) batchId: number,
  ) {
    return this.service.createMissingReferences(BigInt(batchId), 'unor');
  }

  @Post('batches/:batchId/references/pendidikan')
  @UseGuards(BatchOwnershipGuard)
  createMissingPendidikanReferences(
    @Param('batchId', ParseIntPipe) batchId: number,
  ) {
    return this.service.createMissingReferences(BigInt(batchId), 'pendidikan');
  }
}