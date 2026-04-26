import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  INTEGRASI_IMPORT_STATUS,
  type IntegrasiImportStatus,
} from '../import/integrasi-import-status.constant';
import { IntegrasiImportService } from '../import/integrasi-import.service';
import {
  INTEGRASI_JOB_TYPE,
  type QueryIntegrasiJobsDto,
} from './dto/query-integrasi-jobs.dto';
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
      meta: this.toPaginationMeta(result.total, result.page, result.limit),
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
    const summary = await this.repository.getSummary();

    const runningJobs = summary.validatingJobs + summary.committingJobs;
    const errorJobs = summary.errorJobs + summary.failedJobs;

    return {
      totalJobs: summary.totalJobs,
      draftJobs: summary.draftJobs,
      validatingJobs: summary.validatingJobs,
      validatedJobs: summary.validatedJobs,
      committingJobs: summary.committingJobs,
      importedJobs: summary.importedJobs,
      failedJobs: summary.failedJobs,
      cancelledJobs: summary.cancelledJobs,
      errorJobs,
      runningJobs,
      totalRows: summary.totalRows,
      validRows: summary.validRows,
      invalidRows: summary.invalidRows,
      importedRows: summary.importedRows,
      successRatePercent: this.calculatePercent(
        summary.importedJobs,
        summary.totalJobs,
      ),
      importedRowsPercent: this.calculatePercent(
        summary.importedRows,
        summary.totalRows,
      ),
    };
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
      status: result.status,
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
    const status = item.status as IntegrasiImportStatus;

    return {
      id: item.id.toString(),
      type: INTEGRASI_JOB_TYPE.IMPORT_PEGAWAI,
      name: `Import Pegawai - ${item.fileName}`,
      batchCode: item.batchCode,
      fileName: item.fileName,
      status: item.status,
      progress: this.calculateProgress(item),
      totalRows: item.totalRows,
      validRows: item.validRows,
      invalidRows: item.invalidRows,
      importedRows: item.importedRows,
      hasError: this.hasError(status, item.invalidRows),
      isRunning: this.isRunning(status),
      isFinal: this.isFinal(status),
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
    const status = item.status as IntegrasiImportStatus;

    if (status === INTEGRASI_IMPORT_STATUS.IMPORTED) {
      return 100;
    }

    if (status === INTEGRASI_IMPORT_STATUS.CANCELLED) {
      return 0;
    }

    if (status === INTEGRASI_IMPORT_STATUS.FAILED) {
      return Math.min(99, this.calculateDataProgress(item));
    }

    if (status === INTEGRASI_IMPORT_STATUS.COMMITTING) {
      return Math.max(95, this.calculateDataProgress(item));
    }

    if (status === INTEGRASI_IMPORT_STATUS.VALIDATING) {
      return Math.max(25, this.calculateDataProgress(item));
    }

    return this.calculateDataProgress(item);
  }

  private calculateDataProgress(item: ImportBatchJob) {
    if (item.totalRows <= 0) {
      return 0;
    }

    if (item.importedRows > 0) {
      return Math.min(
        100,
        Math.round((item.importedRows / item.totalRows) * 100),
      );
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
      status === INTEGRASI_IMPORT_STATUS.DRAFT ||
      status === INTEGRASI_IMPORT_STATUS.VALIDATED_WITH_ERROR ||
      status === INTEGRASI_IMPORT_STATUS.FAILED
    ) {
      return ['VALIDATE', 'CANCEL'];
    }

    if (status === INTEGRASI_IMPORT_STATUS.VALIDATED) {
      return ['COMMIT', 'CANCEL'];
    }

    return [];
  }

  private hasError(status: IntegrasiImportStatus, invalidRows: number) {
    return (
      invalidRows > 0 ||
      status === INTEGRASI_IMPORT_STATUS.VALIDATED_WITH_ERROR ||
      status === INTEGRASI_IMPORT_STATUS.FAILED
    );
  }

  private isRunning(status: IntegrasiImportStatus) {
    return (
      status === INTEGRASI_IMPORT_STATUS.VALIDATING ||
      status === INTEGRASI_IMPORT_STATUS.COMMITTING
    );
  }

  private isFinal(status: IntegrasiImportStatus) {
    return (
      status === INTEGRASI_IMPORT_STATUS.IMPORTED ||
      status === INTEGRASI_IMPORT_STATUS.CANCELLED ||
      status === INTEGRASI_IMPORT_STATUS.FAILED
    );
  }

  private toPaginationMeta(total: number, page: number, limit: number) {
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private calculatePercent(value: number, total: number) {
    if (total <= 0) {
      return 0;
    }

    return Number(((value / total) * 100).toFixed(2));
  }
}