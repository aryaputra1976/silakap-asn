import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  INTEGRASI_IMPORT_STATUS,
  type IntegrasiImportStatus,
} from '../import/integrasi-import-status.constant';
import {
  INTEGRASI_LOG_TYPE,
  type QueryIntegrasiLogRowsDto,
  type QueryIntegrasiLogsDto,
} from './dto/query-integrasi-logs.dto';
import { IntegrasiLogsRepository } from './integrasi-logs.repository';

type ImportBatchLog = {
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

type ImportStagingRow = {
  id: bigint;
  batchId: bigint;
  rowNumber: number;
  nip: string | null;
  nik: string | null;
  nama: string | null;
  siasnId: string | null;
  rawData: Prisma.JsonValue;
  mappedData: Prisma.JsonValue | null;
  errors: Prisma.JsonValue | null;
  isValid: boolean;
  isImported: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class IntegrasiLogsService {
  constructor(private readonly repository: IntegrasiLogsRepository) {}

  async findLogs(query: QueryIntegrasiLogsDto) {
    const result = await this.repository.findLogs(query);

    return {
      data: result.items.map((item) => this.toLogListItem(item)),
      meta: this.toPaginationMeta(result.total, result.page, result.limit),
    };
  }

  async exportLogsCsv(query: QueryIntegrasiLogsDto) {
    const rows = await this.repository.findLogsForExport(query);
    const csv = this.toCsv(
      [
        'type',
        'title',
        'batch_code',
        'file_name',
        'status',
        'total_rows',
        'valid_rows',
        'invalid_rows',
        'imported_rows',
        'has_error',
        'created_at',
        'updated_at',
      ],
      rows.map((row) => {
        const item = this.toLogListItem(row);

        return [
          item.type,
          item.title,
          item.batchCode,
          item.fileName,
          item.status,
          item.totalRows,
          item.validRows,
          item.invalidRows,
          item.importedRows,
          item.hasError ? 'true' : 'false',
          row.createdAt.toISOString(),
          row.updatedAt.toISOString(),
        ];
      }),
    );

    return {
      filename: `integrasi-logs-${this.formatExportDate()}.csv`,
      csv,
    };
  }

  async findLogDetail(id: bigint) {
    const log = await this.repository.findLogById(id);

    if (!log) {
      throw new NotFoundException('Riwayat sinkronisasi tidak ditemukan');
    }

    return this.toLogDetail(log);
  }

  async findLogRows(id: bigint, query: QueryIntegrasiLogRowsDto) {
    const exists = await this.repository.existsLogById(id);

    if (!exists) {
      throw new NotFoundException('Riwayat sinkronisasi tidak ditemukan');
    }

    const result = await this.repository.findLogRows(id, query);

    return {
      data: result.items.map((row) => this.toRowItem(row)),
      meta: this.toPaginationMeta(result.total, result.page, result.limit),
    };
  }

  async getSummary() {
    const summary = await this.repository.getSummary();

    const totalBatches = summary.totalBatches;
    const failedBatches = summary.failedBatches;
    const errorBatches = summary.errorBatches + failedBatches;
    const runningBatches = summary.validatingBatches + summary.committingBatches;

    return {
      totalBatches,
      draftBatches: summary.draftBatches,
      validatingBatches: summary.validatingBatches,
      validatedBatches: summary.validatedBatches,
      committingBatches: summary.committingBatches,
      importedBatches: summary.importedBatches,
      cancelledBatches: summary.cancelledBatches,
      failedBatches,
      errorBatches,
      runningBatches,
      totalRows: summary.totalRows,
      validRows: summary.validRows,
      invalidRows: summary.invalidRows,
      importedRows: summary.importedRows,
      successRatePercent: this.calculatePercent(
        summary.importedBatches,
        totalBatches,
      ),
      importedRowsPercent: this.calculatePercent(
        summary.importedRows,
        summary.totalRows,
      ),
    };
  }

  private toLogListItem(item: ImportBatchLog) {
    const status = item.status as IntegrasiImportStatus;

    return {
      id: item.id.toString(),
      type: INTEGRASI_LOG_TYPE.IMPORT_PEGAWAI,
      title: `Import Pegawai - ${item.fileName}`,
      batchCode: item.batchCode,
      fileName: item.fileName,
      status: item.status,
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

  private toLogDetail(item: ImportBatchLog) {
    return {
      ...this.toLogListItem(item),
      errors: item.errors,
      availableRowEndpoint: `/integrasi/logs/${item.id.toString()}/rows`,
    };
  }

  private toRowItem(row: ImportStagingRow) {
    return {
      id: row.id.toString(),
      batchId: row.batchId.toString(),
      rowNumber: row.rowNumber,
      nip: row.nip,
      nik: row.nik,
      nama: row.nama,
      siasnId: row.siasnId,
      isValid: row.isValid,
      isImported: row.isImported,
      hasError: !row.isValid || row.errors !== null,
      errors: row.errors,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toPaginationMeta(total: number, page: number, limit: number) {
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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

  private calculatePercent(value: number, total: number) {
    if (total <= 0) {
      return 0;
    }

    return Number(((value / total) * 100).toFixed(2));
  }

  private toCsv(headers: string[], rows: unknown[][]): string {
    const lines = [
      headers.map((header) => this.escapeCsvValue(header)).join(','),
      ...rows.map((row) =>
        row.map((value) => this.escapeCsvValue(value)).join(','),
      ),
    ];

    return `${lines.join('\r\n')}\r\n`;
  }

  private escapeCsvValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    const text = String(value);

    if (/[",\r\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
  }

  private formatExportDate(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
