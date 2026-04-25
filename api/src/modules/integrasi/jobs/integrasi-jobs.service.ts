import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { IntegrasiImportService } from '../import/integrasi-import.service';
import type { QueryIntegrasiJobsDto } from './dto/query-integrasi-jobs.dto';
import { IntegrasiJobsRepository } from './integrasi-jobs.repository';

type ImportBatchJob = {
  id: bigint;
  batchCode: string;
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  importedRows: number;
  status: string;
  errors: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class IntegrasiJobsService {
  constructor(
    private readonly repository: IntegrasiJobsRepository,
    private readonly importService: IntegrasiImportService,
  ) {}

  async findJobs(query: QueryIntegrasiJobsDto) {
    const result = await this.repository.findJobs(query);

    return {
      data: result.items.map((item) => this.toJobListItem(item)),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  async findJobDetail(batchId: bigint) {
    const job = await this.repository.findJobByBatchId(batchId);

    if (!job) {
      throw new NotFoundException('Job sinkronisasi tidak ditemukan');
    }

    return this.toJobDetail(job);
  }

  async getSummary() {
    return this.repository.getSummary();
  }

  async runValidateJob(batchId: bigint) {
    await this.ensureJobExists(batchId);

    const result = await this.importService.validateBatch(batchId);

    return {
      jobId: batchId.toString(),
      type: 'IMPORT_PEGAWAI_VALIDATE',
      status: result.status,
      result,
    };
  }

  async runCommitJob(batchId: bigint) {
    await this.ensureJobExists(batchId);

    const result = await this.importService.commitBatch(batchId);

    return {
      jobId: batchId.toString(),
      type: 'IMPORT_PEGAWAI_COMMIT',
      status: result.status ?? 'IMPORTED',
      result,
    };
  }

  async runCancelJob(batchId: bigint) {
    await this.ensureJobExists(batchId);

    const result = await this.importService.cancelBatch(batchId);

    return {
      jobId: batchId.toString(),
      type: 'IMPORT_PEGAWAI_CANCEL',
      status: result.status,
      result,
    };
  }

  private async ensureJobExists(batchId: bigint) {
    const job = await this.repository.findJobByBatchId(batchId);

    if (!job) {
      throw new NotFoundException('Job sinkronisasi tidak ditemukan');
    }
  }

  private toJobListItem(item: ImportBatchJob) {
    return {
      id: item.id.toString(),
      type: 'IMPORT_PEGAWAI',
      name: `Import Pegawai - ${item.fileName}`,
      batchCode: item.batchCode,
      fileName: item.fileName,
      status: item.status,
      progress: this.calculateProgress(item),
      totalRows: item.totalRows,
      validRows: item.validRows,
      invalidRows: item.invalidRows,
      importedRows: item.importedRows,
      hasError: item.invalidRows > 0 || item.status === 'VALIDATED_WITH_ERROR',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private toJobDetail(item: ImportBatchJob) {
    return {
      ...this.toJobListItem(item),
      errors: item.errors,
      availableActions: this.getAvailableActions(item.status),
    };
  }

  private calculateProgress(item: ImportBatchJob) {
    if (item.status === 'IMPORTED') {
      return 100;
    }

    if (item.totalRows <= 0) {
      return 0;
    }

    if (item.importedRows > 0) {
      return Math.min(100, Math.round((item.importedRows / item.totalRows) * 100));
    }

    if (item.validRows + item.invalidRows > 0) {
      return Math.min(
        95,
        Math.round(((item.validRows + item.invalidRows) / item.totalRows) * 100),
      );
    }

    return 10;
  }

  private getAvailableActions(status: string) {
    if (
      status === 'DRAFT' ||
      status === 'VALIDATED_WITH_ERROR' ||
      status === 'FAILED'
    ) {
      return ['VALIDATE', 'CANCEL'];
    }

    if (status === 'VALIDATED') {
      return ['COMMIT', 'CANCEL'];
    }

    return [];
  }
}